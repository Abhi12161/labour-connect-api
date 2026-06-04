const express = require("express");
const router = express.Router();

const customerAuth =
  require("../middlewares/authenticateCustomer");

const {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  publishJob,
  closeJob,
  getJobs,
} = require(
  "../controllers/fullTimeCustomerJobController"
);

// CUSTOMER JOB MANAGEMENT

router.post(
  "/",
  customerAuth,
  createJob
);

router.get(
  "/my-jobs",
  customerAuth,
  getMyJobs
);

router.get(
  "/job/:id",
  customerAuth,
  getJobById
);

router.put(
  "/job/:id",
  customerAuth,
  updateJob
);

router.put(
  "/job/:id/publish",
  customerAuth,
  publishJob
);

router.put(
  "/job/:id/close",
  customerAuth,
  closeJob
);

// LABOUR SIDE JOB LISTING

router.get(
  "/",
  getJobs
);

module.exports = router;