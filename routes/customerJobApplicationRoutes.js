const express = require("express");
const router = express.Router();

const labourAuth =
  require("../middlewares/authenticateLabour");

const customerAuth =
  require("../middlewares/authenticateCustomer");

const {
  applyJob,
  getApplications,
  acceptApplication,
  rejectApplication,
} = require(
  "../controllers/customerJobApplicationController"
);

router.post(
  "/:jobId/apply",
  labourAuth,
  applyJob
);

router.get(
  "/:jobId/applications",
  customerAuth,
  getApplications
);

router.put(
  "/:id/accept",
  customerAuth,
  acceptApplication
);

router.put(
  "/:id/reject",
  customerAuth,
  rejectApplication
);

module.exports = router;