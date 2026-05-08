const LabourRequest = require("../models/LabourRequest");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");


// 👷 1. CREATE REQUEST (Labour says: I am available)
const createRequest = asyncHandler(async (req, res) => {

  const existing = await LabourRequest.findOne({
    labour: req.labour._id,
    status: "Available",
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Already available",
    });
  }

  const request = await LabourRequest.create({
    labour: req.labour._id,
    city: req.labour.address,
    status: "Available",
    notification:
      "Aap available hain. Customer aapko hire kar sakta hai.",
  });

  const fullRequest = await LabourRequest.findById(request._id)
    .populate("labour");

  return sendSuccess(res, 201, "Request created", {
    request: fullRequest,
  });
});


// 👨 2. ALL LABOURS (Customer Dashboard)
const getAllLabours = asyncHandler(async (req, res) => {

  const requests = await LabourRequest.find({
    status: "Available",
  }).populate("labour");

  return sendSuccess(res, 200, "Labours list", {
    requests,
  });
});


// 📍 3. LOCATION FILTER (City Based)
const getNearbyLabours = asyncHandler(async (req, res) => {

  const { city } = req.query;

  const requests = await LabourRequest.find({
    status: "Available",
    city: city,
  }).populate("labour");

  return sendSuccess(res, 200, "Nearby labours", {
    requests,
  });
});


// 🔥 4. HIRE LABOUR
const hireLabour = asyncHandler(async (req, res) => {

  const request = await LabourRequest.findById(req.params.requestId);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Request not found",
    });
  }

  request.status = "Hired";
  request.notification =
    "Aapko kaam ke liye hire kiya gaya hai.";

  await request.save();

  const fullRequest = await LabourRequest.findById(request._id)
    .populate("labour");

  return sendSuccess(res, 200, "Labour hired", {
    request: fullRequest,
  });
});


// 🔔 5. LABOUR STATUS (My Status)
const getMyStatus = asyncHandler(async (req, res) => {

  const request = await LabourRequest.findOne({
    labour: req.labour._id,
  }).populate("labour");

  return sendSuccess(res, 200, "Status fetched", {
    request,
  });
});


module.exports = {
  createRequest,
  getAllLabours,
  getNearbyLabours,
  hireLabour,
  getMyStatus,
};