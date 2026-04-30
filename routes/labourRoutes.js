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

const router = express.Router();

router.post("/signup", signupValidator, validateRequest, labourAuthController.signup);
router.post("/login", loginValidator, validateRequest, labourAuthController.login);

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
