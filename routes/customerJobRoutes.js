const express = require("express");
const router = express.Router();

const customerAuth =
  require("../middlewares/authenticateCustomer");

const {
  createJob,
  getMyJobs,
  getJobs,
  getJobById,
} = require(
  "../controllers/customerJobController"
);

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

router.get("/", getJobs);

router.get("/:id", getJobById);

module.exports = router;