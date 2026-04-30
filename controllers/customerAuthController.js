const Customer = require("../models/Customer");
const asyncHandler = require("../middlewares/asyncHandler");
const { generateCustomerToken } = require("../utils/jwt");
const { sendSuccess } = require("../utils/response");

const signup = asyncHandler(async (req, res) => {
  const { name, mobile, address, bio, profileImage } = req.body;

  const existingCustomer = await Customer.findOne({ mobile });

  if (existingCustomer) {
    return res.status(409).json({
      success: false,
      message: "Mobile number already registered",
    });
  }

  const customer = await Customer.create({
    name,
    mobile,
    address,
    bio,
    profileImage,
  });
  const token = generateCustomerToken(customer);

  return sendSuccess(res, 201, "Customer signup successful", {
    token,
    customer,
  });
});

const login = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const customer = await Customer.findOne({ mobile });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found, please register first",
    });
  }

  const token = generateCustomerToken(customer);

  return sendSuccess(res, 200, "Customer login successful", {
    token,
    customer,
  });
});

module.exports = {
  signup,
  login,
};
