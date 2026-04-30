const express = require("express");
const customerAuthController = require("../controllers/customerAuthController");
const customerProfileController = require("../controllers/customerProfileController");
const authenticateCustomer = require("../middlewares/authenticateCustomer");
const validateRequest = require("../middlewares/validateRequest");
const {
  signupValidator,
  loginValidator,
  updateProfileValidator,
} = require("../validators/customerValidators");

const router = express.Router();

router.post("/signup", signupValidator, validateRequest, customerAuthController.signup);
router.post("/login", loginValidator, validateRequest, customerAuthController.login);

router.use(authenticateCustomer);

router.get("/profile", customerProfileController.getProfile);
router.put(
  "/profile",
  updateProfileValidator,
  validateRequest,
  customerProfileController.updateProfile
);

module.exports = router;
