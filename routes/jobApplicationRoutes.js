const express = require("express");
const router = express.Router();

const controller = require("../controllers/jobApplicationController");

const authenticateLabour = require("../middlewares/authenticateLabour");
const authenticateCustomer = require("../middlewares/authenticateCustomer");

router.post("/apply", authenticateLabour, controller.applyJob);
router.post("/apply/:jobId", authenticateLabour, controller.applyJob);

router.get("/customer", authenticateCustomer, controller.getCustomerApplications);
router.get(
  "/customer/notifications",
  authenticateCustomer,
  controller.getCustomerNotifications
);
router.put(
  "/customer/cancel/:applicationId",
  authenticateCustomer,
  controller.cancelApplication
);

router.get("/my", authenticateLabour, controller.getMyApplications);
router.get("/notifications", authenticateLabour, controller.getLabourNotifications);
router.put("/cancel/:applicationId", authenticateLabour, controller.cancelApplication);

module.exports = router;
