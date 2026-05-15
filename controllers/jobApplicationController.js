const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");

const populateApplication = (query) =>
  query.populate("labour").populate("customer").populate("job");

// ✅ APPLY = AUTO ASSIGN — koi hire/accept step nahi
const applyJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId || req.body.jobId;

  if (!jobId) {
    return res.status(400).json({
      success: false,
      message: "jobId is required",
    });
  }

  const job = await Job.findById(jobId).populate("customer");

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  if (job.status !== "Open") {
    return res.status(400).json({
      success: false,
      message: "Ye job ab available nahi hai",
    });
  }

  if (job.hiredCount >= job.requiredLabours) {
    return res.status(400).json({
      success: false,
      message: "Is job ki saari positions bhar gayi hain",
    });
  }

  const alreadyApplied = await JobApplication.findOne({
    job: job._id,
    labour: req.labour._id,
  });

  if (alreadyApplied) {
    return res.status(400).json({
      success: false,
      message: "Aap pehle hi apply kar chuke hain",
    });
  }

  // ✅ Direct Assigned — apply karo, turant assign
  const application = await JobApplication.create({
    job: job._id,
    labour: req.labour._id,
    customer: job.customer._id,
    status: "Assigned",
    labourNotification: `Aapko "${job.title}" job par assign kar diya gaya hai.`,
    customerNotification: `${req.labour.name} aapki "${job.title}" job par assign ho gaya hai.`,
    labourNotifications: [{
      type: "Assigned",
      message: `Aapko "${job.title}" job par assign kar diya gaya hai.`,
    }],
    customerNotifications: [{
      type: "Assigned",
      message: `${req.labour.name} aapki "${job.title}" job par assign ho gaya hai.`,
    }],
  });

  // ✅ hiredCount badhao
  job.hiredCount += 1;

  // ✅ Jaise hi sab positions bhar jaayein — Job band
  if (job.hiredCount >= job.requiredLabours) {
    job.status = "Completed";
  }

  await job.save();

  const fullApplication = await populateApplication(
    JobApplication.findById(application._id)
  );

  return sendSuccess(res, 201, "Assigned successfully", {
    application: fullApplication,
    jobFull: job.status === "Completed",
  });
});

// ✅ Labour ki apni assigned jobs
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await populateApplication(
    JobApplication.find({ labour: req.labour._id }).sort({ updatedAt: -1 })
  );
  return sendSuccess(res, 200, "Applications fetched", { applications });
});

// ✅ Customer ke jobs par assigned labours
const getCustomerApplications = asyncHandler(async (req, res) => {
  const applications = await populateApplication(
    JobApplication.find({ customer: req.customer._id }).sort({ updatedAt: -1 })
  );
  return sendSuccess(res, 200, "Applications fetched", { applications });
});

// ✅ Cancel — Labour ya Customer dono kar sakte hain
const cancelApplication = asyncHandler(async (req, res) => {
  const application = await JobApplication.findById(
    req.params.applicationId
  ).populate("job");

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  const isCustomer = Boolean(req.customer);
  const isOwner = isCustomer
    ? String(application.customer) === String(req.customer._id)
    : String(application.labour) === String(req.labour._id);

  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: "Aapko ye cancel karne ka permission nahi hai",
    });
  }

  const reason =
    req.body.reason ||
    (isCustomer ? "Customer ne cancel kiya." : "Labour ne withdraw kiya.");

  application.status = "Cancelled";
  application.cancellationReason = reason;

  application.labourNotification = reason;
  application.customerNotification = isCustomer
    ? `Aapne "${application.job.title}" se ek labour hataya.`
    : `${req.labour?.name || "Labour"} ne "${application.job.title}" se withdraw kar liya.`;

  application.labourNotifications.push({ type: "Cancelled", message: reason });
  application.customerNotifications.push({
    type: "Cancelled",
    message: application.customerNotification,
  });

  // ✅ Position free karo — job wapas Open
  const job = application.job;
  if (job && job.hiredCount > 0) {
    job.hiredCount -= 1;
    if (job.status === "Completed") {
      job.status = "Open";
    }
    await job.save();
  }

  await application.save();

  const fullApplication = await populateApplication(
    JobApplication.findById(application._id)
  );

  return sendSuccess(res, 200, "Application cancelled successfully", {
    application: fullApplication,
  });
});

// ✅ Labour notifications
const getLabourNotifications = asyncHandler(async (req, res) => {
  const notifications = await populateApplication(
    JobApplication.find({ labour: req.labour._id }).sort({ updatedAt: -1 })
  );
  return sendSuccess(res, 200, "Notifications fetched", { notifications });
});

// ✅ Customer notifications
const getCustomerNotifications = asyncHandler(async (req, res) => {
  const notifications = await populateApplication(
    JobApplication.find({ customer: req.customer._id }).sort({ updatedAt: -1 })
  );
  return sendSuccess(res, 200, "Notifications fetched", { notifications });
});

// ❌ hireLabour      — HATA DIYA
// ❌ acceptJob       — HATA DIYA
// ❌ addNotification — HATA DIYA

module.exports = {
  applyJob,
  getMyApplications,
  getCustomerApplications,
  cancelApplication,
  getLabourNotifications,
  getCustomerNotifications,
};