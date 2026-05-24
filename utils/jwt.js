const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../constants/auth");

const generateLabourToken = (labour) =>
  jwt.sign(
    {
      id: labour._id,
      mobile: labour.mobile,
      role: "labour",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const generateCustomerToken = (customer) =>
  jwt.sign(
    {
      id: customer._id,
      mobile: customer.mobile,
      role: "customer",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const generateAdminToken = (admin) =>
  jwt.sign(
    {
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: "admin",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

module.exports = {
  generateLabourToken,
  generateCustomerToken,
  generateAdminToken,
};
