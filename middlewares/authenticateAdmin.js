const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constants/auth");
const { findAdminByEmail } = require("../constants/adminUsers");

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Admin authorization token is required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const admin = findAdminByEmail(decoded.email);

    if (!admin || admin.mobile !== decoded.mobile) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

module.exports = authenticateAdmin;
