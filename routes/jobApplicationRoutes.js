const express = require("express");
const router = express.Router();

const controller = require(
  "../controllers/jobApplicationController"
);

const authenticateLabour = require(
  "../middlewares/authenticateLabour"
);

const authenticateCustomer = require(
  "../middlewares/authenticateCustomer"
);


// 👷 APPLY
router.post(
  "/apply/:jobId",
  authenticateLabour,
  controller.applyJob
);


// 👨 CUSTOMER DASHBOARD
router.get(
  "/customer",
  authenticateCustomer,
  controller.getCustomerApplications
);


// 🔥 HIRE
router.put(
  "/hire/:applicationId",
  authenticateCustomer,
  controller.hireLabour
);


// 🔔 LABOUR NOTIFICATIONS
router.get(
  "/notifications",
  authenticateLabour,
  controller.getLabourNotifications
);

module.exports = router;