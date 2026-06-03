const CustomerJob =
  require("../models/CustomerJob");

const CustomerJobApplication =
  require("../models/CustomerJobApplication");

const asyncHandler =
  require("../middlewares/asyncHandler");

const { sendSuccess } =
  require("../utils/response");

// APPLY JOB
const applyJob = asyncHandler(
  async (req, res) => {
    const { message } = req.body;

    const application =
      await CustomerJobApplication.create({
        jobId: req.params.jobId,
        labourId: req.labour._id,
        message,
      });

    return sendSuccess(
      res,
      201,
      "Applied successfully",
      { application }
    );
  }
);

// CUSTOMER VIEW APPLICATIONS
const getApplications =
  asyncHandler(async (req, res) => {
    const applications =
      await CustomerJobApplication.find({
        jobId: req.params.jobId,
      })
        .populate(
          "labourId",
          "name mobile city profileImage"
        )
        .sort({ createdAt: -1 });

    return sendSuccess(
      res,
      200,
      "Applications fetched",
      { applications }
    );
  });

// ACCEPT APPLICATION
const acceptApplication =
  asyncHandler(async (req, res) => {
    const application =
      await CustomerJobApplication.findById(
        req.params.id
      );

    application.status = "Accepted";

    await application.save();

    return sendSuccess(
      res,
      200,
      "Application accepted",
      { application }
    );
  });

// REJECT APPLICATION
const rejectApplication =
  asyncHandler(async (req, res) => {
    const application =
      await CustomerJobApplication.findById(
        req.params.id
      );

    application.status = "Rejected";

    await application.save();

    return sendSuccess(
      res,
      200,
      "Application rejected",
      { application }
    );
  });

module.exports = {
  applyJob,
  getApplications,
  acceptApplication,
  rejectApplication,
};