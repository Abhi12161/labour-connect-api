const HireRequest = require("../models/HireRequest");
const FullTimeJobPost = require("../models/FullTimeJobPost");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");

// CUSTOMER SEND REQUEST
const sendHireRequest = asyncHandler(async (req, res) => {
  const { jobPostId, message } = req.body;

  const jobPost = await FullTimeJobPost.findById(
    jobPostId
  );

  if (!jobPost) {
    return res.status(404).json({
      success: false,
      message: "Job post not found",
    });
  }

  const existing = await HireRequest.findOne({
    customerId: req.customer._id,
    jobPostId,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Request already sent",
    });
  }

  const request = await HireRequest.create({
    jobPostId,
    labourId: jobPost.labourId,
    customerId: req.customer._id,
    message,
  });

  return sendSuccess(
    res,
    201,
    "Hire request sent successfully",
    { request }
  );
});

// LABOUR NOTIFICATIONS
const getMyHireRequests = asyncHandler(
  async (req, res) => {
    const requests = await HireRequest.find({
      labourId: req.labour._id,
    })
      .populate(
        "customerId",
        "name mobile city"
      )
      .populate("jobPostId");

    return sendSuccess(
      res,
      200,
      "Hire requests fetched",
      { requests }
    );
  }
);

// ACCEPT
const acceptRequest = asyncHandler(
  async (req, res) => {
    const request = await HireRequest.findOne({
      _id: req.params.id,
      labourId: req.labour._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "Accepted";

    await request.save();

    return sendSuccess(
      res,
      200,
      "Request accepted",
      { request }
    );
  }
);

// REJECT
const rejectRequest = asyncHandler(
  async (req, res) => {
    const request = await HireRequest.findOne({
      _id: req.params.id,
      labourId: req.labour._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "Rejected";

    await request.save();

    return sendSuccess(
      res,
      200,
      "Request rejected",
      { request }
    );
  }
);

module.exports = {
  sendHireRequest,
  getMyHireRequests,
  acceptRequest,
  rejectRequest,
};