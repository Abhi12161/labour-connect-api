const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authenticateCustomer = require("../middlewares/authenticateCustomer");
const authenticateLabour = require("../middlewares/authenticateLabour");

router.get(
  "/customer",
  authenticateCustomer,
  dashboardController.getCustomerDashboard
);

router.get(
  "/labour",
  authenticateLabour,
  dashboardController.getLabourDashboard
);

module.exports = router;
