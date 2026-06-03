const express = require("express");
const router = express.Router();

const labourAuth =
 require("../middlewares/authenticateLabour");

const customerAuth =
  require("../middlewares/authenticateCustomer");

const {
  sendHireRequest,
  getMyHireRequests,
  acceptRequest,
  rejectRequest,
} = require(
  "../controllers/hireRequestController"
);

// CUSTOMER
router.post(
  "/",
  customerAuth,
  sendHireRequest
);

// LABOUR
router.get(
  "/my-requests",
  labourAuth,
  getMyHireRequests
);

router.put(
  "/:id/accept",
  labourAuth,
  acceptRequest
);

router.put(
  "/:id/reject",
  labourAuth,
  rejectRequest
);

module.exports = router;