const jwt = require("jsonwebtoken");
const Labour = require("../models/Labour");
const { JWT_SECRET } = require("../constants/auth");

const authenticateLabour = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const labour = await Labour.findById(decoded.id);

    if (!labour) {
      return res.status(401).json({
        success: false,
        message: "Labour account not found",
      });
    }

    req.labour = labour;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateLabour;
