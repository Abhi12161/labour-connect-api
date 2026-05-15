const express = require("express");

const router = express.Router();

const Job = require("../models/Job");

const JobApplication = require("../models/JobApplication");

const LabourRequest = require("../models/LabourRequest");


// 👇 all jobs
router.get("/jobs", async (req, res) => {

  const jobs = await Job.find()
    .populate("customer")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    jobs,
  });
});


// 👇 all applications
router.get("/applications", async (req, res) => {

  const applications =
    await JobApplication.find()

      .populate("job")

      .populate("labour")

      .populate("customer")

      .sort({ createdAt: -1 });

  res.json({
    success: true,
    applications,
  });
});


// 👇 all requests
router.get("/requests", async (req, res) => {

  const requests = await LabourRequest.find()

    .populate("labour")

    .populate("customer")

    .sort({ createdAt: -1 });

  res.json({
    success: true,
    requests,
  });
});

module.exports = router;