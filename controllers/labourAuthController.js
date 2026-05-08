const Labour = require("../models/Labour");
const asyncHandler = require("../middlewares/asyncHandler");
const { generateLabourToken } = require("../utils/jwt");
const { sendSuccess } = require("../utils/response");

const signup = asyncHandler(async (req, res) => {
  const { name, mobile, address, bio, profileImage,city } = req.body;

  const existingLabour = await Labour.findOne({ mobile });

  if (existingLabour) {
    return res.status(409).json({
      success: false,
      message: "Mobile number already registered",
    });
  }

  const labour = await Labour.create({
    name,
    mobile,
    address,
    bio,
    profileImage,
    city

  });

  const token = generateLabourToken(labour);

  return sendSuccess(res, 201, "Labour signup successful", {
    token,
    labour,
  });
});

const login = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const labour = await Labour.findOne({ mobile });

  if (!labour) {
    return res.status(404).json({
      success: false,
      message: "Labour not found, please register first",
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
};
