const FullTimeJobPost = require("../models/FullTimeJobPost");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");

// CREATE JOB POST
const createJobPost = asyncHandler(async (req, res) => {
  const {
    category,
    role,
    experience,
    expectedSalary,
    city,
    description,
  } = req.body;

  const jobPost = await FullTimeJobPost.create({
    labourId: req.labour._id,
    category,
    role,
    experience,
    expectedSalary,
    city,
    description,
  });

  return sendSuccess(
    res,
    201,
    "Job post created successfully",
    { jobPost }
  );
});

// MY POSTS
const getMyJobPosts = asyncHandler(async (req, res) => {
  const posts = await FullTimeJobPost.find({
    labourId: req.labour._id,
  }).sort({ createdAt: -1 });

  return sendSuccess(
    res,
    200,
    "My job posts fetched",
    { posts }
  );
});

// ALL POSTS FOR CUSTOMERS
const getJobPosts = asyncHandler(async (req, res) => {
  const filter = {
    status: "Active",
  };

  if (req.query.city) {
    filter.city = req.query.city;
  }

  if (req.query.role) {
    filter.role = req.query.role;
  }

  const posts = await FullTimeJobPost.find(filter)
    .populate(
      "labourId",
      "name mobile city profileImage"
    )
    .sort({ createdAt: -1 });

  return sendSuccess(
    res,
    200,
    "Job posts fetched successfully",
    { posts }
  );
});

// SINGLE POST
const getJobPostById = asyncHandler(async (req, res) => {
  const post = await FullTimeJobPost.findById(
    req.params.id
  ).populate(
    "labourId",
    "name mobile city profileImage"
  );

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Job post not found",
    });
  }

  return sendSuccess(
    res,
    200,
    "Job post fetched successfully",
    { post }
  );
});

// CLOSE POST
const closeJobPost = asyncHandler(async (req, res) => {
  const post = await FullTimeJobPost.findOne({
    _id: req.params.id,
    labourId: req.labour._id,
  });

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  post.status = "Closed";

  await post.save();

  return sendSuccess(
    res,
    200,
    "Job post closed successfully",
    { post }
  );
});

module.exports = {
  createJobPost,
  getMyJobPosts,
  getJobPosts,
  getJobPostById,
  closeJobPost,
};