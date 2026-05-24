const Customer = require("../models/Customer");
const Labour = require("../models/Labour");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const LabourRequest = require("../models/LabourRequest");
const asyncHandler = require("../middlewares/asyncHandler");
const { findAdmin } = require("../constants/adminUsers");
const { generateAdminToken } = require("../utils/jwt");
const { sendSuccess } = require("../utils/response");

const populateJob = (query) =>
  query
    .populate("customer", "name mobile address bio profileImage city")
    .populate("assignedLabour", "name mobile address bio profileImage city skills");

const populateApplication = (query) =>
  query
    .populate({
      path: "job",
      populate: [
        { path: "customer", select: "name mobile address bio profileImage city" },
        { path: "assignedLabour", select: "name mobile address bio profileImage city skills" },
      ],
    })
    .populate("labour", "name mobile address bio profileImage city skills")
    .populate("customer", "name mobile address bio profileImage city");

const populateLabourRequest = (query) =>
  query
    .populate("labour", "name mobile address bio profileImage city skills")
    .populate("customer", "name mobile address bio profileImage city");

const login = asyncHandler(async (req, res) => {
  const { name, email, mobile } = req.body;

  if (!name || !email || !mobile) {
    return res.status(400).json({
      success: false,
      message: "name, email and mobile are required",
    });
  }

  const admin = findAdmin({ name, email, mobile });

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin details",
    });
  }

  const token = generateAdminToken(admin);

  return sendSuccess(res, 200, "Admin login successful", {
    token,
    admin,
  });
});

const getOverview = asyncHandler(async (req, res) => {
  const [customers, labours, jobs, applications, labourRequests] =
    await Promise.all([
      Customer.find().sort({ createdAt: -1 }),
      Labour.find().sort({ createdAt: -1 }),
      populateJob(Job.find().sort({ createdAt: -1 })),
      populateApplication(JobApplication.find().sort({ createdAt: -1 })),
      populateLabourRequest(LabourRequest.find().sort({ createdAt: -1 })),
    ]);

  return sendSuccess(res, 200, "Admin data fetched", {
    admin: req.admin,
    counts: {
      customers: customers.length,
      labours: labours.length,
      jobs: jobs.length,
      applications: applications.length,
      labourRequests: labourRequests.length,
    },
    customers,
    labours,
    jobs,
    applications,
    labourRequests,
  });
});

const getJobs = asyncHandler(async (req, res) => {
  const jobs = await populateJob(Job.find().sort({ createdAt: -1 }));
  return sendSuccess(res, 200, "Jobs fetched", { jobs });
});

const getApplications = asyncHandler(async (req, res) => {
  const applications = await populateApplication(
    JobApplication.find().sort({ createdAt: -1 })
  );
  return sendSuccess(res, 200, "Applications fetched", { applications });
});

const getRequests = asyncHandler(async (req, res) => {
  const requests = await populateLabourRequest(
    LabourRequest.find().sort({ createdAt: -1 })
  );
  return sendSuccess(res, 200, "Requests fetched", { requests });
});

module.exports = {
  login,
  getOverview,
  getJobs,
  getApplications,
  getRequests,
};
