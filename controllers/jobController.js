const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");
const City = require("../models/City");
const Customer = require("../models/Customer");

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const populateJob = (query) =>
  query
    .populate("customer", "name mobile address bio profileImage city")
    .populate("assignedLabour", "name mobile address bio profileImage city skills");

const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    skill,
    description,
    city,
    location,
    timing,
    requiredDate,
    level,
    requiredLabours,
  } = req.body;

  const job = await Job.create({
    title,
    skill,
    description,
    city,
    location,
    timing,
    requiredDate,
    level,

    // 👇 kitne labour chahiye
    requiredLabours: requiredLabours || 1,

    // 👇 initially 0 hire honge
    hiredCount: 0,

    customer: req.customer._id,
  });

  return sendSuccess(res, 201, "Job created successfully", {
    job,
  });
});

const getJobs = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const jobs = await populateJob(
    Job.find({
      status: "Open",
      createdAt: {
        $gte: start,
        $lte: end,
      },
      $expr: {
        $lt: ["$hiredCount", "$requiredLabours"],
      },
    }).sort({ createdAt: -1 })
  );

  // Guest user ko sab jobs dikhao
  if (!req.customer?._id) {
    return sendSuccess(res, 200, "Jobs fetched", {
      jobs,
    });
  }

  const customer = await Customer.findById(req.customer._id).lean();

  if (!customer?.city) {
    return sendSuccess(res, 200, "Jobs fetched", {
      jobs,
    });
  }

  // Saare cities ek hi baar load karo
  const cities = await City.find().lean();

  const cityMap = new Map(
    cities.map((city) => [
      city.name.trim().toLowerCase(),
      city,
    ])
  );

  const customerCity = cityMap.get(
    customer.city.trim().toLowerCase()
  );

  if (!customerCity) {
    return sendSuccess(res, 200, "Jobs fetched", {
      jobs,
    });
  }

  const nearbyJobs = [];

  for (const job of jobs) {
    if (!job.city) continue;

    const jobCity = cityMap.get(
      job.city.trim().toLowerCase()
    );

    if (!jobCity) continue;

    const distance = getDistanceKm(
      customerCity.latitude,
      customerCity.longitude,
      jobCity.latitude,
      jobCity.longitude
    );

    if (distance <= 20) {
      nearbyJobs.push({
        ...job.toObject(),
        distanceKm: Number(distance.toFixed(1)),
      });
    }
  }

  return sendSuccess(res, 200, "Jobs fetched", {
    jobs: nearbyJobs,
  });
});
const getJobById = asyncHandler(async (req, res) => {
  const job = await populateJob(Job.findById(req.params.jobId));

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  return sendSuccess(res, 200, "Job details fetched", { job });
});

const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await populateJob(
    Job.find({ customer: req.customer._id }).sort({ createdAt: -1 })
  );

  return sendSuccess(res, 200, "My jobs fetched", { jobs });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.jobId,
    customer: req.customer._id,
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  const allowedFields = [
    "title",
    "skill",
    "description",
    "city",
    "location",
    "timing",
    "requiredDate",
    "level",
    "status",
  ];

  let hasChanges = false;
  for (const field of allowedFields) {
    if (typeof req.body[field] !== "undefined") {
      job[field] = req.body[field];
      hasChanges = true;
    }
  }

  const updateMessage =
    req.body.updateMessage ||
    (hasChanges
      ? `Job "${job.title}" has been updated. Please review the latest details.`
      : "");

  if (updateMessage) {
    job.updateHistory.push({
      message: updateMessage,
      updatedByRole: "Customer",
      updatedBy: req.customer._id,
    });
  }

  await job.save();

  if (updateMessage) {
    const applications = await JobApplication.find({
      job: job._id,
      status: { $in: ["Applied", "Hired", "Accepted"] },
    });

    await Promise.all(
      applications.map((application) => {
        application.labourNotification = updateMessage;
        application.customerNotification = `You updated the job "${job.title}".`;
        application.labourNotifications.push({
          type: "Updated",
          message: updateMessage,
        });
        application.customerNotifications.push({
          type: "Updated",
          message: `You updated the job "${job.title}".`,
        });
        return application.save();
      })
    );
  }

  const updatedJob = await populateJob(Job.findById(job._id));

  return sendSuccess(res, 200, "Job updated successfully", {
    job: updatedJob,
  });
});

const cancelJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.jobId,
    customer: req.customer._id,
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  const reason = req.body.reason || "Customer cancelled this job.";

  job.status = "Cancelled";
  job.cancellationReason = reason;
  job.updateHistory.push({
    message: reason,
    updatedByRole: "Customer",
    updatedBy: req.customer._id,
  });

  await job.save();

  const applications = await JobApplication.find({
    job: job._id,
    status: { $in: ["Applied", "Hired", "Accepted"] },
  });

  await Promise.all(
    applications.map((application) => {
      application.status = "Cancelled";
      application.cancellationReason = reason;
      application.labourNotification = reason;
      application.customerNotification = `You cancelled the job "${job.title}".`;
      application.labourNotifications.push({
        type: "Cancelled",
        message: reason,
      });
      application.customerNotifications.push({
        type: "Cancelled",
        message: `You cancelled the job "${job.title}".`,
      });
      return application.save();
    })
  );

  const updatedJob = await populateJob(Job.findById(job._id));

  return sendSuccess(res, 200, "Job cancelled successfully", {
    job: updatedJob,
  });
});

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  cancelJob,
};
