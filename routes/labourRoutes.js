const express = require("express");
const labourAuthController = require("../controllers/labourAuthController");
const labourProfileController = require("../controllers/labourProfileController");
const authenticateLabour = require("../middlewares/authenticateLabour");
const validateRequest = require("../middlewares/validateRequest");
const {
  signupValidator,
  loginValidator,
  updateProfileValidator,
  addSkillValidator,
  updateSkillValidator,
  deleteSkillValidator,
} = require("../validators/labourValidators");
const {
  signupRateLimiter,
  loginRateLimiter,
} = require("../controllers/labourAuthController");

const router = express.Router();

// Public routes — rate limiter pehle lagega, phir validator, phir controller
router.post("/signup", signupRateLimiter, signupValidator, validateRequest, labourAuthController.signup);
router.post("/login", loginRateLimiter, loginValidator, validateRequest, labourAuthController.login);

// Protected routes — JWT verify hoga
router.use(authenticateLabour);

router.get("/profile", labourProfileController.getProfile);
router.put(
  "/profile",
  updateProfileValidator,
  validateRequest,
  labourProfileController.updateProfile
);
router.post(
  "/skills",
  addSkillValidator,
  validateRequest,
  labourProfileController.addSkill
);
router.put(
  "/skills/:skillId",
  updateSkillValidator,
  validateRequest,
  labourProfileController.updateSkill
);
router.delete(
  "/skills/:skillId",
  deleteSkillValidator,
  validateRequest,
  labourProfileController.deleteSkill
);

module.exports = router;