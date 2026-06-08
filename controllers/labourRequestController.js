const LabourRequest = require("../models/LabourRequest");
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


//  1. CREATE REQUEST (Labour says: I am available)
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
    city: req.labour.city || req.labour.address || "",
    status: "Available",
    notification:
      "Aap available hain. Customer aapko hire kar sakta hai.",
    labourNotifications: [
      "Aap available hain. Customer aapko hire kar sakta hai.",
    ],
  });

  const fullRequest = await LabourRequest.findById(request._id)
    .populate("labour")
    .populate("customer");

  return sendSuccess(res, 201, "Request created", {
    request: fullRequest,
  });
});


// 👨 2. ALL LABOURS (Customer Dashboard)
const getAllLabours = asyncHandler(async (req, res) => {

  const requests = await LabourRequest.find({
    status: "Available",
    expiresAt: {
      $gt: new Date(),
    },
  })
    .populate("labour")
    .populate("customer");

  return sendSuccess(res, 200, "Labours list", {
    requests,
  });
});


// 📍 3. LOCATION FILTER - 20km radius (FIXED: single DB call for all cities)
const getNearbyLabours = asyncHandler(async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return sendSuccess(res, 200, "Nearby labours", {
      requests: [],
    });
  }

  // Saari cities ek hi baar load karo
  const allCities = await City.find().lean();
  const cityMap = new Map(
    allCities.map((c) => [c.name.trim().toLowerCase(), c])
  );

  const customerCity = cityMap.get(city.trim().toLowerCase());

  if (!customerCity) {
    return sendSuccess(res, 200, "Nearby labours", {
      requests: [],
    });
  }

  const requests = await LabourRequest.find({
    status: "Available",
    expiresAt: {
      $gt: new Date(),
    },
  })
    .populate("labour")
    .populate("customer");

  const nearbyRequests = [];

  for (const request of requests) {
    if (!request.city) continue;

    const labourCity = cityMap.get(request.city.trim().toLowerCase());

    if (!labourCity) continue;

    const distance = getDistanceKm(
      customerCity.latitude,
      customerCity.longitude,
      labourCity.latitude,
      labourCity.longitude
    );

    if (distance <= 20) {
      nearbyRequests.push({
        ...request.toObject(),
        distanceKm: Number(distance.toFixed(1)),
      });
    }
  }

  return sendSuccess(res, 200, "Nearby labours", {
    requests: nearbyRequests,
  });
});

// 🔥 4. HIRE LABOUR
const hireLabour = asyncHandler(async (req, res) => {
  const { location, timing, notes } = req.body;

  const request = await LabourRequest.findById(req.params.requestId);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Request not found",
    });
  }

  request.status = "Hired";
  request.customer = req.customer._id;
  request.workDetails = {
    location: location || "",
    timing: timing || "",
    notes: notes || "",
    customerName: req.customer.name || "",
    customerMobile: req.customer.mobile || "",
  };
  request.notification =
    "Aapko kaam ke liye hire kiya gaya hai. Full details aapke status me available hain.";
  request.labourNotifications.push(
    "Aapko kaam ke liye hire kiya gaya hai. Full details aapke status me available hain."
  );
  request.customerNotifications.push(
    `Aapne ${req.customer.name} account se labour ko hire kar liya hai.`
  );

  await request.save();

  const fullRequest = await LabourRequest.findById(request._id)
    .populate("labour")
    .populate("customer");

  return sendSuccess(res, 200, "Labour hired", {
    request: fullRequest,
  });
});


// 🔔 5. LABOUR STATUS (My Status)
const getMyStatus = asyncHandler(async (req, res) => {

  const request = await LabourRequest.findOne({
    labour: req.labour._id,
  })
    .populate("labour")
    .populate("customer");

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
