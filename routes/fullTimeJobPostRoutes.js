const express = require("express");
const router = express.Router();

const labourAuth =require("../middlewares/authenticateLabour");

const {
  createJobPost,
  getMyJobPosts,
  getJobPosts,
  getJobPostById,
  closeJobPost,
} = require(
  "../controllers/fullTimeJobPostController"
);

router.post(
  "/",
  labourAuth,
  createJobPost
);

router.get(
  "/my-posts",
  labourAuth,
  getMyJobPosts
);

router.get(
  "/",
  getJobPosts
);

router.get(
  "/:id",
  getJobPostById
);

router.put(
  "/:id/close",
  labourAuth,
  closeJobPost
);

module.exports = router;