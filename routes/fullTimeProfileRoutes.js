const express = require("express");
const router = express.Router();
const labourAuth = require("../middlewares/authenticateLabour");

const {
  getProfile,
  updateProfile,
  publishProfile,
  updateAvailability,
  getCandidates,
  getCandidateById,
} = require("../controllers/fullTimeProfileController");

router.get(
  "/profile",
  labourAuth,
  getProfile
);

router.put(
  "/profile",
  labourAuth,
  updateProfile
);

router.put(
  "/publish",
  labourAuth,
  publishProfile
);

router.put(
  "/availability",
  labourAuth,
  updateAvailability
);

router.get(
  "/candidates",
  getCandidates
);

router.get(
  "/candidate/:id",
  getCandidateById
);

module.exports = router;