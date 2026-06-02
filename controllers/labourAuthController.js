const Labour = require("../models/Labour");
const asyncHandler = require("../middlewares/asyncHandler");
const { generateLabourToken } = require("../utils/jwt");
const { sendSuccess } = require("../utils/response");
const rateLimit = require("express-rate-limit");

// ─────────────────────────────────────────────────────────────
// RATE LIMITERS
// ─────────────────────────────────────────────────────────────

const signupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message:
      "Too many signup attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message:
      "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────────────────────

const signup = asyncHandler(async (req, res) => {
  const { name, mobile, address, bio, profileImage, city } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({
      success: false,
      message: "Name and mobile are required fields.",
    });
  }

  const mobileRegex = /^[6-9]\d{9}$/;

  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid mobile number. Please enter a valid 10-digit mobile number.",
    });
  }

  // Check if mobile already exists
  const existingLabour = await Labour.findOne({ mobile });

  if (existingLabour) {
    return res.status(409).json({
      success: false,
      message: "This mobile number is already registered. Please login.",
    });
  }

  const labour = await Labour.create({
    name,
    mobile,
    address,
    bio,
    profileImage,
    city,
  });

  const token = generateLabourToken(labour);

  return sendSuccess(res, 201, "Labour signup successful", {
    token,
    labour,
  });
});

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────

const login = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required.",
    });
  }

  const labour = await Labour.findOne({ mobile });

  if (!labour) {
    return res.status(404).json({
      success: false,
      message: "Labour not found, please register first.",
    });
  }

  const token = generateLabourToken(labour);

  return sendSuccess(res, 200, "Labour login successful", {
    token,
    labour,
  });
});

module.exports = {
  signup,
  login,
  signupRateLimiter,
  loginRateLimiter,
};