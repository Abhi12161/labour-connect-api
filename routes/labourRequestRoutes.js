const express = require("express");
const router = express.Router();

const controller = require("../controllers/labourRequestController");

const authenticateLabour = require("../middlewares/authenticateLabour");
const authenticateCustomer = require("../middlewares/authenticateCustomer");


// 👷 Labour APIs
router.post("/request", authenticateLabour, controller.createRequest);
router.get("/me", authenticateLabour, controller.getMyStatus);


// 👨 Customer APIs
router.get("/list", authenticateCustomer, controller.getAllLabours);
router.get("/nearby", authenticateCustomer, controller.getNearbyLabours);
router.put("/hire/:requestId", authenticateCustomer, controller.hireLabour);


module.exports = router;