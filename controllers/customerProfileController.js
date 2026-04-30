const Customer = require("../models/Customer");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");

const getProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, "Profile fetched successfully", {
    customer: req.customer,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (req.body.mobile && req.body.mobile !== req.customer.mobile) {
    const existingCustomer = await Customer.findOne({
      mobile: req.body.mobile,
      _id: { $ne: req.customer._id },
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already in use",
      });
    }
  }

  const allowedFields = ["name", "mobile", "address", "bio", "profileImage"];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      req.customer[field] = req.body[field];
    }
  }

  await req.customer.save();

  return sendSuccess(res, 200, "Profile updated successfully", {
    customer: req.customer,
  });
});

module.exports = {
  getProfile,
  updateProfile,
};
