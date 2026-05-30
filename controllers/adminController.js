const Customer = require("../models/Customer");
const Labour = require("../models/Labour");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const LabourRequest = require("../models/LabourRequest");
const asyncHandler = require("../middlewares/asyncHandler");
const { findAdmin } = require("../constants/adminUsers");
const { generateAdminToken } = require("../utils/jwt");
const { sendSuccess } = require("../utils/response");

const activeAssignmentStatuses = ["Applied", "Assigned", "Hired", "Accepted"];
const assignedStatuses = ["Assigned", "Hired", "Accepted"];
const activeLabourRequestStatuses = ["Hired", "Accepted"];

const cityCoordinates = {
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  patna: { lat: 25.5941, lng: 85.1376 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  surat: { lat: 21.1702, lng: 72.8311 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
};

const populateJob = (query) =>
  query
    .populate("customer", "name mobile address bio profileImage city")
    .populate("assignedLabour", "name mobile address bio profileImage city skills")
    .populate("assignmentHistory.labour", "name mobile city skills")
    .populate("assignmentHistory.previousLabour", "name mobile city skills");

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

const normalize = (value) => String(value || "").trim().toLowerCase();

const hasSkill = (labour, skill) => {
  if (!skill) {
    return true;
  }

  const normalizedSkill = normalize(skill);
  return labour.skills.some((item) => normalize(item.name).includes(normalizedSkill));
};

const getDistanceInKm = (fromCity, toCity) => {
  const from = cityCoordinates[normalize(fromCity)];
  const to = cityCoordinates[normalize(toCity)];

  if (!from || !to) {
    return null;
  }

  const earthRadiusKm = 6371;
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const latDistance = toRadians(to.lat - from.lat);
  const lngDistance = toRadians(to.lng - from.lng);
  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusKm * c * 10) / 10;
};

const getContactLinks = (mobile) => {
  const cleanMobile = String(mobile || "").replace(/\D/g, "");

  return {
    call: cleanMobile ? `tel:${cleanMobile}` : "",
    whatsapp: cleanMobile ? `https://wa.me/91${cleanMobile.slice(-10)}` : "",
  };
};

const getDisplayStatus = (status) => {
  if (status === "Open") {
    return "Pending";
  }

  return status;
};

const formatRequest = (job) => ({
  _id: job._id,
  title: job.title,
  jobCategory: job.skill,
  city: job.city,
  location: job.location,
  timing: job.timing,
  requiredDate: job.requiredDate,
  status: job.status,
  displayStatus: getDisplayStatus(job.status),
  requiredLabours: job.requiredLabours,
  hiredCount: job.hiredCount,
  customer: job.customer
    ? {
        ...job.customer.toJSON(),
        contactLinks: getContactLinks(job.customer.mobile),
      }
    : null,
  assignedLabour: job.assignedLabour
    ? {
        ...job.assignedLabour.toJSON(),
        contactLinks: getContactLinks(job.assignedLabour.mobile),
      }
    : null,
  assignmentHistory: job.assignmentHistory,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

const formatLabour = (labour, activeJobs, availabilityStatus) => ({
  ...labour.toJSON(),
  availabilityStatus:
    availabilityStatus || (activeJobs.length > 0 ? "Busy" : "Available"),
  currentActiveJobs: activeJobs.length,
  activeJobs,
  contactLinks: getContactLinks(labour.mobile),
});

const labourMatchesSearch = (labour, search) => {
  const normalizedSearch = normalize(search);
  if (!normalizedSearch) {
    return true;
  }

  return (
    normalize(labour.name).includes(normalizedSearch) ||
    normalize(labour.mobile).includes(normalizedSearch)
  );
};

const jobMatchesSearch = (job, search) => {
  const normalizedSearch = normalize(search);
  if (!normalizedSearch) {
    return true;
  }

  return (
    normalize(job.title).includes(normalizedSearch) ||
    normalize(job.customer?.name).includes(normalizedSearch) ||
    normalize(job.customer?.mobile).includes(normalizedSearch)
  );
};

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

const getAssignmentPanel = asyncHandler(async (req, res) => {
  const {
    searchCustomer,
    searchLabour,
    city,
    skill,
    status,
  } = req.query;

  const jobQuery = {};
  if (city) {
    jobQuery.city = new RegExp(city, "i");
  }
  if (skill) {
    jobQuery.skill = new RegExp(skill, "i");
  }
  if (status) {
    jobQuery.status = status;
  }

  const labourQuery = {};
  if (city) {
    labourQuery.city = new RegExp(city, "i");
  }

  const [jobs, labours, activeApplications, activeLabourRequests] = await Promise.all([
    populateJob(Job.find(jobQuery).sort({ createdAt: -1 })),
    Labour.find(labourQuery).sort({ createdAt: -1 }),
    populateApplication(
      JobApplication.find({
        status: { $in: assignedStatuses },
      }).sort({ updatedAt: -1 })
    ),
    populateLabourRequest(
      LabourRequest.find({
        status: { $in: ["Available", ...activeLabourRequestStatuses] },
      }).sort({ updatedAt: -1 })
    ),
  ]);

  const activeJobsByLabour = activeApplications.reduce((result, application) => {
    const labourId = String(application.labour?._id || application.labour);
    if (!result[labourId]) {
      result[labourId] = [];
    }
    result[labourId].push(application.job);
    return result;
  }, {});

  const labourRequestByLabour = activeLabourRequests.reduce((result, request) => {
    const labourId = String(request.labour?._id || request.labour);
    if (!result[labourId]) {
      result[labourId] = [];
    }
    result[labourId].push(request);
    return result;
  }, {});

  const customerRequests = jobs
    .filter((job) => jobMatchesSearch(job, searchCustomer))
    .map(formatRequest);

  const labourList = labours
    .filter((labour) => labourMatchesSearch(labour, searchLabour))
    .filter((labour) => hasSkill(labour, skill))
    .map((labour) => {
      const directRequests = labourRequestByLabour[String(labour._id)] || [];
      const directActiveRequests = directRequests.filter((request) =>
        activeLabourRequestStatuses.includes(request.status)
      );
      const isAvailable = directRequests.some(
        (request) => request.status === "Available"
      );
      const activeJobs = [
        ...(activeJobsByLabour[String(labour._id)] || []),
        ...directActiveRequests,
      ];

      return formatLabour(
        labour,
        activeJobs,
        activeJobs.length > 0 ? "Busy" : isAvailable ? "Available" : "Idle"
      );
    });

  return sendSuccess(res, 200, "Assignment panel fetched", {
    filters: {
      searchCustomer: searchCustomer || "",
      searchLabour: searchLabour || "",
      city: city || "",
      skill: skill || "",
      status: status || "",
    },
    customerRequests,
    labours: labourList,
  });
});

const getNearbyLabours = asyncHandler(async (req, res) => {
  const job = await populateJob(Job.findById(req.params.jobId));

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Customer request not found",
    });
  }

  const labours = await Labour.find().sort({ createdAt: -1 });
  const [applications, directRequests] = await Promise.all([
    JobApplication.find({
      labour: { $in: labours.map((labour) => labour._id) },
      status: { $in: assignedStatuses },
    }).populate("job"),
    populateLabourRequest(
      LabourRequest.find({
        labour: { $in: labours.map((labour) => labour._id) },
        status: { $in: ["Available", ...activeLabourRequestStatuses] },
      })
    ),
  ]);

  const activeJobsByLabour = applications.reduce((result, application) => {
    const labourId = String(application.labour);
    if (!result[labourId]) {
      result[labourId] = [];
    }
    result[labourId].push(application.job);
    return result;
  }, {});

  const labourRequestByLabour = directRequests.reduce((result, request) => {
    const labourId = String(request.labour?._id || request.labour);
    if (!result[labourId]) {
      result[labourId] = [];
    }
    result[labourId].push(request);
    return result;
  }, {});

  const suggestedLabours = labours
    .filter((labour) => hasSkill(labour, req.query.skill || job.skill))
    .map((labour) => {
      const directLabourRequests = labourRequestByLabour[String(labour._id)] || [];
      const directActiveRequests = directLabourRequests.filter((request) =>
        activeLabourRequestStatuses.includes(request.status)
      );
      const activeJobs = [
        ...(activeJobsByLabour[String(labour._id)] || []),
        ...directActiveRequests,
      ];
      const isAvailable = directLabourRequests.some(
        (request) => request.status === "Available"
      );
      const distanceKm = getDistanceInKm(job.city, labour.city);
      return {
        ...formatLabour(
          labour,
          activeJobs,
          activeJobs.length > 0 ? "Busy" : isAvailable ? "Available" : "Idle"
        ),
        distanceKm,
        exactCityMatch: normalize(job.city) === normalize(labour.city),
      };
    })
    .sort((first, second) => {
      if (first.exactCityMatch !== second.exactCityMatch) {
        return first.exactCityMatch ? -1 : 1;
      }
      if (first.distanceKm === null && second.distanceKm === null) {
        return first.currentActiveJobs - second.currentActiveJobs;
      }
      if (first.distanceKm === null) {
        return 1;
      }
      if (second.distanceKm === null) {
        return -1;
      }
      return first.distanceKm - second.distanceKm;
    });

  return sendSuccess(res, 200, "Nearby labours fetched", {
    customerRequest: formatRequest(job),
    labours: suggestedLabours,
  });
});

const assignLabour = asyncHandler(async (req, res) => {
  const { jobId, labourId, note } = req.body;

  if (!jobId || !labourId) {
    return res.status(400).json({
      success: false,
      message: "jobId and labourId are required",
    });
  }

  const [job, labour] = await Promise.all([
    Job.findById(jobId),
    Labour.findById(labourId),
  ]);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Customer request not found",
    });
  }

  if (!labour) {
    return res.status(404).json({
      success: false,
      message: "Labour not found",
    });
  }

  const previousLabour = job.assignedLabour;
  const isReassign = Boolean(previousLabour);

  if (previousLabour && String(previousLabour) !== String(labour._id)) {
    await JobApplication.updateMany(
      {
        job: job._id,
        labour: previousLabour,
        status: { $in: activeAssignmentStatuses },
      },
      {
        $set: {
          status: "Cancelled",
          cancellationReason: `Reassigned by admin to ${labour.name}.`,
          labourNotification: `Admin ne aapko "${job.title}" request se remove kar diya hai.`,
          customerNotification: `Admin ne "${job.title}" request par labour change kiya hai.`,
        },
        $push: {
          labourNotifications: {
            type: "Cancelled",
            message: `Admin ne aapko "${job.title}" request se remove kar diya hai.`,
          },
          customerNotifications: {
            type: "Updated",
            message: `Admin ne "${job.title}" request par labour change kiya hai.`,
          },
        },
      }
    );
  }

  let application = await JobApplication.findOne({
    job: job._id,
    labour: labour._id,
  });

  if (!application) {
    application = await JobApplication.create({
      job: job._id,
      labour: labour._id,
      customer: job.customer,
      status: "Assigned",
    });
  }

  application.status = "Assigned";
  application.cancellationReason = "";
  application.labourNotification = `Admin ne aapko "${job.title}" request assign kiya hai.`;
  application.customerNotification = `Admin ne ${labour.name} ko aapki "${job.title}" request par assign kiya hai.`;
  application.labourNotifications.push({
    type: "Assigned",
    message: application.labourNotification,
  });
  application.customerNotifications.push({
    type: "Assigned",
    message: application.customerNotification,
  });
  await application.save();

  job.assignedLabour = labour._id;
  job.status = "Assigned";
  job.hiredCount = Math.max(job.hiredCount || 0, 1);
  job.assignmentHistory.push({
    labour: labour._id,
    previousLabour,
    assignedByRole: "Admin",
    assignedBy: req.admin,
    action: isReassign ? "Reassigned" : "Assigned",
    note: note || "",
  });

  await job.save();

  const [updatedJob, updatedApplication] = await Promise.all([
    populateJob(Job.findById(job._id)),
    populateApplication(JobApplication.findById(application._id)),
  ]);

  return sendSuccess(res, 200, "Labour assigned successfully", {
    customerRequest: formatRequest(updatedJob),
    application: updatedApplication,
  });
});

const removeAssignedLabour = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Customer request not found",
    });
  }

  const previousLabour = job.assignedLabour;

  if (!previousLabour) {
    return res.status(400).json({
      success: false,
      message: "No labour assigned to this request",
    });
  }

  await JobApplication.updateMany(
    {
      job: job._id,
      labour: previousLabour,
      status: { $in: activeAssignmentStatuses },
    },
    {
      $set: {
        status: "Cancelled",
        cancellationReason: "Assignment removed by admin.",
        labourNotification: `Admin ne aapko "${job.title}" request se remove kar diya hai.`,
        customerNotification: `Admin ne "${job.title}" request se assigned labour remove kar diya hai.`,
      },
      $push: {
        labourNotifications: {
          type: "Cancelled",
          message: `Admin ne aapko "${job.title}" request se remove kar diya hai.`,
        },
        customerNotifications: {
          type: "Updated",
          message: `Admin ne "${job.title}" request se assigned labour remove kar diya hai.`,
        },
      },
    }
  );

  job.assignedLabour = null;
  job.status = "Open";
  job.hiredCount = 0;
  job.assignmentHistory.push({
    previousLabour,
    assignedByRole: "Admin",
    assignedBy: req.admin,
    action: "Removed",
    note: req.body.note || "",
  });

  await job.save();

  const updatedJob = await populateJob(Job.findById(job._id));

  return sendSuccess(res, 200, "Assigned labour removed successfully", {
    customerRequest: formatRequest(updatedJob),
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
  getAssignmentPanel,
  getNearbyLabours,
  assignLabour,
  removeAssignedLabour,
  getJobs,
  getApplications,
  getRequests,
};
