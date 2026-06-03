const CustomerJob = require("../models/CustomerJob");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");

// CREATE JOB
const createJob = asyncHandler(async (req, res) => {
  const job = await CustomerJob.create({
    customerId: req.customer._id,
    ...req.body,
  });

  return sendSuccess(
    res,
    201,
    "Job posted successfully",
    { job }
  );
});

// MY JOBS
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await CustomerJob.find({
    customerId: req.customer._id,
  });

  return sendSuccess(
    res,
    200,
    "Jobs fetched",
    { jobs }
  );
});

// ALL JOBS FOR LABOURS
const getJobs = asyncHandler(async (req, res) => {
  const filter = {
    status: "Active",
  };

  if (req.query.city) {
    filter.city = req.query.city;
  }

  const jobs = await CustomerJob.find(filter)
    .populate(
      "customerId",
      "name mobile city"
    )
    .sort({ createdAt: -1 });

  return sendSuccess(
    res,
    200,
    "Jobs fetched successfully",
    { jobs }
  );
});

// SINGLE JOB
const getJobById = asyncHandler(
  async (req, res) => {
    const job =
      await CustomerJob.findById(
        req.params.id
      );

    return sendSuccess(
      res,
      200,
      "Job fetched successfully",
      { job }
    );
  }
);

module.exports = {
  createJob,
  getMyJobs,
  getJobs,
  getJobById,
};