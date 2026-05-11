const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const authenticateCustomer = require("../middlewares/authenticateCustomer");

router.get("/", jobController.getJobs);
router.post("/", authenticateCustomer, jobController.createJob);
router.get("/my", authenticateCustomer, jobController.getMyJobs);
router.put("/:jobId", authenticateCustomer, jobController.updateJob);
router.put("/:jobId/cancel", authenticateCustomer, jobController.cancelJob);
router.get("/:jobId", jobController.getJobById);

module.exports = router;
