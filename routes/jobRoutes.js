const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const authenticateCustomer = require("../middlewares/authenticateCustomer");

// 🔥 protected routes
router.use(authenticateCustomer);

router.post("/", jobController.createJob);
router.get("/", jobController.getJobs);
router.get("/my", jobController.getMyJobs);

module.exports = router;