const Job = require("../models/Job");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");


// ✅ CREATE JOB
const createJob = asyncHandler(async (req, res) => {
  const { title, skill, description, city, location, timing, level } = req.body;

  const job = await Job.create({
    title,
    skill,
    description,
    city,
    location,
    timing,
    level,
    customer: req.customer._id, // 🔥 important
  });

  return sendSuccess(res, 201, "Job created successfully", {
    job,
  });
});


// ✅ GET ALL JOBS
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate("customer", "name mobile");

  return sendSuccess(res, 200, "Jobs fetched", { jobs });
});


// ✅ GET MY JOBS (customer)
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ customer: req.customer._id });

  return sendSuccess(res, 200, "My jobs fetched", { jobs });
});

module.exports = {
  createJob,
  getJobs,
  getMyJobs,
};