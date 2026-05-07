const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");

const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");


// ✅ APPLY JOB
const applyJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId)
    .populate("customer");

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  // ✅ Already applied check
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

  // ✅ Create application
  const application = await JobApplication.create({
    job: job._id,
    labour: req.labour._id,
    customer: job.customer._id,

    status: "Applied",

    labourNotification:
      "Application submitted. You will get notification soon.",

    customerNotification:
      `${req.labour.name} applied for your job.`,
  });

  // ✅ FULL RESPONSE
  const fullApplication =
    await JobApplication.findById(application._id)
      .populate("labour")
      .populate("customer")
      .populate("job");

  return sendSuccess(
    res,
    201,
    "Applied successfully",
    {
      application: fullApplication,
    }
  );
});


// ✅ CUSTOMER DASHBOARD
const getCustomerApplications = asyncHandler(
  async (req, res) => {

    const applications = await JobApplication.find({
      customer: req.customer._id,
    })
      .populate("labour")
      .populate("customer")
      .populate("job");

    return sendSuccess(
      res,
      200,
      "Applications fetched",
      {
        applications,
      }
    );
  }
);


// ✅ HIRE LABOUR
const hireLabour = asyncHandler(async (req, res) => {
  const application = await JobApplication.findById(
    req.params.applicationId
  );

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  // ✅ Update status
  application.status = "Hired";

  // ✅ Notification
  application.labourNotification =
    "Congratulations! You are hired.";

  await application.save();

  // ✅ FULL RESPONSE
  const fullApplication =
    await JobApplication.findById(application._id)
      .populate("labour")
      .populate("customer")
      .populate("job");

  return sendSuccess(
    res,
    200,
    "Labour hired successfully",
    {
      application: fullApplication,
    }
  );
});


// ✅ LABOUR NOTIFICATIONS
const getLabourNotifications = asyncHandler(
  async (req, res) => {

    const notifications = await JobApplication.find({
      labour: req.labour._id,
    })
      .populate("labour")
      .populate("customer")
      .populate("job");

    return sendSuccess(
      res,
      200,
      "Notifications fetched",
      {
        notifications,
      }
    );
  }
);


module.exports = {
  applyJob,
  getCustomerApplications,
  hireLabour,
  getLabourNotifications,
};