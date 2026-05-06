const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const authenticateCustomer = require("../middlewares/authenticateCustomer");


// ✅ PUBLIC ROUTE (सब देख सकते हैं)
router.get("/", jobController.getJobs);


// 🔐 PROTECTED ROUTES (सिर्फ customer)
router.post("/", authenticateCustomer, jobController.createJob);
router.get("/my", authenticateCustomer, jobController.getMyJobs);


module.exports = router;