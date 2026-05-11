const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");

const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");

const populateApplication = (query) =>
  query
    .populate("labour")
    .populate("customer")
    .populate("job");

const addNotification = (application, recipient, type, message) => {
  if (recipient === "labour") {
    application.labourNotification = message;
    application.labourNotifications.push({ type, message });
    return;
  }

  application.customerNotification = message;
  application.customerNotifications.push({ type, message });
};

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
      message: "This job is not open for applications",
    });
  }

  const alreadyApplied = await JobApplication.findOne({
    job: job._id,
    labour: req.labour._id,
  });

  if (alreadyApplied) {
    return res.status(400).json({
      success: false,
      message: "Already applied",
    });
  }

  const application = await JobApplication.create({
    job: job._id,
    labour: req.labour._id,
    customer: job.customer._id,
    status: "Applied",
    labourNotification:
      "Aapka job application submit ho gaya hai. Aapko notification mil jayegi.",
    customerNotification: `${req.labour.name} ne aapki job par apply kiya hai. Aapko notify kar diya gaya hai.`,
    labourNotifications: [
      {
        type: "Applied",
        message:
          "Aapka job application submit ho gaya hai. Aapko notification mil jayegi.",
      },
    ],
    customerNotifications: [
      {
        type: "Applied",
        message: `${req.labour.name} ne aapki job par apply kiya hai. Aapko notify kar diya gaya hai.`,
      },
    ],
  });

  const fullApplication = await populateApplication(
    JobApplication.findById(application._id)
  );

  return sendSuccess(res, 201, "Applied successfully", {
    application: fullApplication,
    applicant: fullApplication.labour,
    customerNotification: fullApplication.customerNotification,
    labourNotification: fullApplication.labourNotification,
  });
});

const getCustomerApplications = asyncHandler(async (req, res) => {
  const applications = await populateApplication(
    JobApplication.find({
      customer: req.customer._id,
    }).sort({ updatedAt: -1 })
  );

  return sendSuccess(res, 200, "Applications fetched", {
    applications,
  });
});

const hireLabour = asyncHandler(async (req, res) => {
  const application = await JobApplication.findById(
    req.params.applicationId
  )
    .populate("job")
    .populate("labour");

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  if (String(application.customer) !== String(req.customer._id)) {
    return res.status(403).json({
      success: false,
      message: "You can only hire from your own job applications",
    });
  }

  application.status = "Hired";
  application.cancellationReason = "";

  addNotification(
    application,
    "labour",
    "Hired",
    `You are hired for "${application.job.title}". Location: ${
      application.job.location || application.job.city || "N/A"
    }, Time: ${application.job.timing || "N/A"}, Customer: ${
      req.customer.name
    }, Contact: ${req.customer.mobile}.`
  );
  addNotification(
    application,
    "customer",
    "Hired",
    `You hired ${application.labour.name} for "${application.job.title}".`
  );

  const siblingApplications = await JobApplication.find({
    job: application.job._id,
    _id: { $ne: application._id },
    status: "Applied",
  });

  await Promise.all(
    siblingApplications.map((item) => {
      item.status = "Rejected";
      item.cancellationReason = "Another labour has been hired for this job.";
      addNotification(
        item,
        "labour",
        "StatusChanged",
        `The job "${application.job.title}" is no longer available because another labour was hired.`
      );
      return item.save();
    })
  );

  application.job.status = "Assigned";
  application.job.assignedLabour = application.labour._id;
  await application.job.save();

  await application.save();

  const fullApplication = await populateApplication(
    JobApplication.findById(application._id)
  );

  return sendSuccess(res, 200, "Labour hired successfully", {
    application: fullApplication,
  });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await populateApplication(
    JobApplication.find({
      labour: req.labour._id,
    }).sort({ updatedAt: -1 })
  );

  return sendSuccess(res, 200, "Applications fetched", {
    applications,
  });
});

const getLabourNotifications = asyncHandler(async (req, res) => {
  const notifications = await populateApplication(
    JobApplication.find({
      labour: req.labour._id,
    }).sort({ updatedAt: -1 })
  );

  return sendSuccess(res, 200, "Notifications fetched", {
    notifications,
  });
});

const getCustomerNotifications = asyncHandler(async (req, res) => {
  const notifications = await populateApplication(
    JobApplication.find({
      customer: req.customer._id,
    }).sort({ updatedAt: -1 })
  );

  return sendSuccess(res, 200, "Notifications fetched", {
    notifications,
  });
});

const acceptJob = asyncHandler(async (req, res) => {
  const application = await JobApplication.findById(
    req.params.applicationId
  ).populate("job");

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  if (String(application.labour) !== String(req.labour._id)) {
    return res.status(403).json({
      success: false,
      message: "You can only accept your own hired jobs",
    });
  }

  if (application.status !== "Hired") {
    return res.status(400).json({
      success: false,
      message: "Only hired jobs can be accepted",
    });
  }

  application.status = "Accepted";

  addNotification(
    application,
    "labour",
    "Accepted",
    `You accepted the job "${application.job.title}".`
  );
  addNotification(
    application,
    "customer",
    "Accepted",
    `${req.labour.name} accepted your job "${application.job.title}".`
  );

  application.job.status = "Accepted";
  await application.job.save();
  await application.save();

  const fullApplication = await populateApplication(
    JobApplication.findById(application._id)
  );

  return sendSuccess(res, 200, "Job accepted successfully", {
    application: fullApplication,
  });
});

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
      message: "You do not have permission to cancel this application",
    });
  }

  const reason =
    req.body.reason ||
    (isCustomer
      ? "Customer cancelled this application."
      : "Labour withdrew this application.");

  application.status = "Cancelled";
  application.cancellationReason = reason;

  addNotification(application, "labour", "Cancelled", reason);
  addNotification(
    application,
    "customer",
    "Cancelled",
    isCustomer
      ? `You cancelled the application for "${application.job.title}".`
      : `${req.labour.name} withdrew the application for "${application.job.title}".`
  );

  if (
    application.job &&
    application.job.assignedLabour &&
    String(application.job.assignedLabour) === String(application.labour)
  ) {
    application.job.assignedLabour = null;
    application.job.status = "Open";
    await application.job.save();
  }

  await application.save();

  const fullApplication = await populateApplication(
    JobApplication.findById(application._id)
  );

  return sendSuccess(res, 200, "Application cancelled successfully", {
    application: fullApplication,
  });
});

module.exports = {
  applyJob,
  getCustomerApplications,
  hireLabour,
  getMyApplications,
  getLabourNotifications,
  getCustomerNotifications,
  acceptJob,
  cancelApplication,
};
