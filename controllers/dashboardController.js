const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const LabourRequest = require("../models/LabourRequest");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");

const activeApplicationStatuses = ["Applied", "Assigned", "Hired", "Accepted"];
const hiredApplicationStatuses = ["Assigned", "Hired", "Accepted"];
const previousApplicationStatuses = ["Cancelled", "Rejected"];
const previousJobStatuses = ["Completed", "Cancelled"];
const directHireStatuses = ["Hired", "Accepted", "Cancelled"];
const activeDirectHireStatuses = ["Hired", "Accepted"];
const previousDirectHireStatuses = ["Cancelled"];

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

const isPreviousApplication = (application) =>
  previousApplicationStatuses.includes(application.status) ||
  previousJobStatuses.includes(application.job?.status);

const getCustomerDashboard = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;

  const [jobPosts, applications, directHires] = await Promise.all([
    populateJob(Job.find({ customer: customerId }).sort({ createdAt: -1 })),
    populateApplication(
      JobApplication.find({ customer: customerId }).sort({ updatedAt: -1 })
    ),
    populateLabourRequest(
      LabourRequest.find({
        customer: customerId,
        status: { $in: directHireStatuses },
      }).sort({ updatedAt: -1 })
    ),
  ]);

  const hiredLabours = applications.filter((application) =>
    hiredApplicationStatuses.includes(application.status)
  );

  const previousJobs = applications.filter(isPreviousApplication);
  const activeDirectHires = directHires.filter((request) =>
    activeDirectHireStatuses.includes(request.status)
  );
  const previousDirectHires = directHires.filter((request) =>
    previousDirectHireStatuses.includes(request.status)
  );

  return sendSuccess(res, 200, "Customer dashboard fetched", {
    dashboard: {
      profile: req.customer,
      counts: {
        jobPosts: jobPosts.length,
        applications: applications.length,
        hiredLabours: hiredLabours.length + activeDirectHires.length,
        previousJobs: previousJobs.length + previousDirectHires.length,
      },
      jobPosts,
      applications,
      hiredLabours,
      directHires: activeDirectHires,
      directHireHistory: directHires,
      previousDirectHires,
      previousJobs,
    },
  });
});

const getLabourDashboard = asyncHandler(async (req, res) => {
  const labourId = req.labour._id;

  const [applications, directHireRequests] = await Promise.all([
    populateApplication(
      JobApplication.find({ labour: labourId }).sort({ updatedAt: -1 })
    ),
    populateLabourRequest(
      LabourRequest.find({
        labour: labourId,
        status: { $in: directHireStatuses },
      }).sort({ updatedAt: -1 })
    ),
  ]);

  const appliedJobs = applications.filter((application) =>
    activeApplicationStatuses.includes(application.status)
  );

  const hiredJobs = applications.filter((application) =>
    hiredApplicationStatuses.includes(application.status)
  );

  const previousJobs = applications.filter(isPreviousApplication);
  const activeDirectHireRequests = directHireRequests.filter((request) =>
    activeDirectHireStatuses.includes(request.status)
  );
  const previousDirectHireRequests = directHireRequests.filter((request) =>
    previousDirectHireStatuses.includes(request.status)
  );

  return sendSuccess(res, 200, "Labour dashboard fetched", {
    dashboard: {
      profile: req.labour,
      counts: {
        appliedJobs: applications.length,
        hiredJobs: hiredJobs.length + activeDirectHireRequests.length,
        previousJobs: previousJobs.length + previousDirectHireRequests.length,
      },
      appliedJobs: applications,
      activeJobs: appliedJobs,
      hiredJobs,
      directHireRequests: activeDirectHireRequests,
      directHireHistory: directHireRequests,
      previousDirectHireRequests,
      previousJobs,
    },
  });
});

module.exports = {
  getCustomerDashboard,
  getLabourDashboard,
};
