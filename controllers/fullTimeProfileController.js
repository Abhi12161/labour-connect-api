const Labour = require("../models/Labour");
const FullTimeProfile = require("../models/FullTimeProfile");
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

// GET MY PROFILE
const getProfile = asyncHandler(async (req, res) => {
  const profile = await FullTimeProfile.findOne({
    labourId: req.labour._id,
  });

  return sendSuccess(res, 200, "Profile fetched successfully", {
    labour: req.labour,
    profile,
  });
});

// CREATE / UPDATE PROFILE
const updateProfile = asyncHandler(async (req, res) => {
  const {
    category,
    role,
    experience,
    expectedSalary,
    availability,
    education,
    aboutMe,
    isAvailable,
  } = req.body;

  const profile = await FullTimeProfile.findOneAndUpdate(
    { labourId: req.labour._id },
    {
      labourId: req.labour._id,
      category,
      role,
      experience,
      expectedSalary,
      availability,
      education,
      aboutMe,
      isAvailable,
    },
    { new: true, upsert: true, runValidators: true }
  );

  return sendSuccess(res, 200, "Profile updated successfully", {
    labour: req.labour,
    profile,
  });
});

// PUBLISH PROFILE
const publishProfile = asyncHandler(async (req, res) => {
  const profile = await FullTimeProfile.findOne({
    labourId: req.labour._id,
  });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Please complete profile first",
    });
  }

  profile.profileStatus = "Active";
  await profile.save();

  return sendSuccess(res, 200, "Profile published successfully", { profile });
});

// UPDATE AVAILABILITY
const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  if (typeof isAvailable !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isAvailable must be true or false",
    });
  }

  const profile = await FullTimeProfile.findOneAndUpdate(
    { labourId: req.labour._id },
    { isAvailable },
    { new: true }
  );

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Profile not found",
    });
  }

  return sendSuccess(res, 200, "Availability updated successfully", { profile });
});

// GET ALL ACTIVE CANDIDATES - 20km RADIUS FILTER
const getCandidates = asyncHandler(async (req, res) => {
  const filter = {
    profileStatus: "Active",
    isAvailable: true,
  };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.role) filter.role = req.query.role;

  const candidates = await FullTimeProfile.find(filter)
    .populate("labourId", "name mobile city profileImage")
    .sort({ createdAt: -1 });

  // Agar city query nahi di to sab return karo
  if (!req.query.city) {
    return sendSuccess(res, 200, "Candidates fetched successfully", { candidates });
  }

  // 20km radius filter
  const allCities = await City.find().lean();
  const cityMap = new Map(
    allCities.map((c) => [c.name.trim().toLowerCase(), c])
  );

  const customerCity = cityMap.get(req.query.city.trim().toLowerCase());

  // City nahi mili to sab dikhao
  if (!customerCity) {
    return sendSuccess(res, 200, "Candidates fetched successfully", { candidates });
  }

  const nearbyCandidates = candidates.filter((candidate) => {
    const labourCityName = candidate.labourId?.city;
    if (!labourCityName) return false;

    const labourCity = cityMap.get(labourCityName.trim().toLowerCase());
    if (!labourCity) return false;

    const distance = getDistanceKm(
      customerCity.latitude,
      customerCity.longitude,
      labourCity.latitude,
      labourCity.longitude
    );

    return distance <= 20;
  });

  return sendSuccess(res, 200, "Candidates fetched successfully", {
    candidates: nearbyCandidates,
  });
});

// GET SINGLE CANDIDATE
const getCandidateById = asyncHandler(async (req, res) => {
  const candidate = await FullTimeProfile.findById(req.params.id).populate(
    "labourId",
    "name mobile city profileImage address bio"
  );

  if (!candidate) {
    return res.status(404).json({
      success: false,
      message: "Candidate not found",
    });
  }

  return sendSuccess(res, 200, "Candidate fetched successfully", { candidate });
});

module.exports = {
  getProfile,
  updateProfile,
  publishProfile,
  updateAvailability,
  getCandidates,
  getCandidateById,
};
