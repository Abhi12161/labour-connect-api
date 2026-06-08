const FullTimeCustomerJob = require("../models/FullTimeCustomerJob");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");
const City = require("../models/City");

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

// CREATE JOB
const createJob = asyncHandler(async (req, res) => {
  const {
    category, role, city, experience,
    salaryFrom, salaryTo, vacancies,
    workingHours, description,
  } = req.body;

  const job = await FullTimeCustomerJob.create({
    customerId: req.customer._id,
    category, role, city, experience,
    salaryFrom, salaryTo, vacancies,
    workingHours, description,
  });

  return sendSuccess(res, 201, "Job created successfully", { job });
});

// GET MY JOBS
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await FullTimeCustomerJob.find({
    customerId: req.customer._id,
  }).sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Jobs fetched successfully", { jobs });
});

// GET SINGLE JOB
const getJobById = asyncHandler(async (req, res) => {
  const job = await FullTimeCustomerJob.findById(req.params.id).populate(
    "customerId",
    "name mobile city profileImage"
  );

  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  return sendSuccess(res, 200, "Job fetched successfully", { job });
});

// UPDATE JOB
const updateJob = asyncHandler(async (req, res) => {
  const job = await FullTimeCustomerJob.findOneAndUpdate(
    { _id: req.params.id, customerId: req.customer._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  return sendSuccess(res, 200, "Job updated successfully", { job });
});

// PUBLISH JOB
const publishJob = asyncHandler(async (req, res) => {
  const job = await FullTimeCustomerJob.findOne({
    _id: req.params.id,
    customerId: req.customer._id,
  });

  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  job.status = "Published";
  await job.save();

  return sendSuccess(res, 200, "Job published successfully", { job });
});

// CLOSE JOB
const closeJob = asyncHandler(async (req, res) => {
  const job = await FullTimeCustomerJob.findOne({
    _id: req.params.id,
    customerId: req.customer._id,
  });

  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  job.status = "Closed";
  await job.save();

  return sendSuccess(res, 200, "Job closed successfully", { job });
});

// GET ALL PUBLISHED JOBS - 20km RADIUS FILTER
const getJobs = asyncHandler(async (req, res) => {
  const filter = { status: "Published" };

  if (req.query.role) filter.role = req.query.role;
  if (req.query.category) filter.category = req.query.category;

  // City query hai to 20km radius filter lagao
  if (req.query.city) {
    const allCities = await City.find().lean();
    const cityMap = new Map(
      allCities.map((c) => [c.name.trim().toLowerCase(), c])
    );

    const userCity = cityMap.get(req.query.city.trim().toLowerCase());

    // City nahi mili to exact match fallback
    if (!userCity) {
      filter.city = req.query.city;
      const jobs = await FullTimeCustomerJob.find(filter)
        .populate("customerId", "name mobile city profileImage")
        .sort({ createdAt: -1 });
      return sendSuccess(res, 200, "Jobs fetched successfully", { jobs });
    }

    const allJobs = await FullTimeCustomerJob.find(filter)
      .populate("customerId", "name mobile city profileImage")
      .sort({ createdAt: -1 });

    const nearbyJobs = allJobs.filter((job) => {
      if (!job.city) return false;
      const jobCity = cityMap.get(job.city.trim().toLowerCase());
      if (!jobCity) return false;

      const distance = getDistanceKm(
        userCity.latitude,
        userCity.longitude,
        jobCity.latitude,
        jobCity.longitude
      );
      return distance <= 20;
    });

    return sendSuccess(res, 200, "Jobs fetched successfully", {
      jobs: nearbyJobs,
    });
  }

  // City query nahi di to sab dikhao
  const jobs = await FullTimeCustomerJob.find(filter)
    .populate("customerId", "name mobile city profileImage")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Jobs fetched successfully", { jobs });
});

module.exports = {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  publishJob,
  closeJob,
  getJobs,
};
