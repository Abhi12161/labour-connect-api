const FullTimeJobPost = require("../models/FullTimeJobPost");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");
const City = require("../models/City");

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// CREATE JOB POST
const createJobPost = asyncHandler(async (req, res) => {
  const { category, role, experience, expectedSalary, city, description } = req.body;

  const jobPost = await FullTimeJobPost.create({
    labourId: req.labour._id,
    category,
    role,
    experience,
    expectedSalary,
    city,
    description,
  });

  return sendSuccess(res, 201, "Job post created successfully", { jobPost });
});

// MY POSTS
const getMyJobPosts = asyncHandler(async (req, res) => {
  const posts = await FullTimeJobPost.find({
    labourId: req.labour._id,
  }).sort({ createdAt: -1 });

  return sendSuccess(res, 200, "My job posts fetched", { posts });
});

// ALL POSTS FOR CUSTOMERS - 20km RADIUS FILTER
const getJobPosts = asyncHandler(async (req, res) => {
  const filter = { status: "Active" };

  if (req.query.role) filter.role = req.query.role;

  // City query hai to 20km radius filter lagao
  if (req.query.city) {
    const allCities = await City.find().lean();
    const cityMap = new Map(
      allCities.map((c) => [c.name.trim().toLowerCase(), c])
    );

    const customerCity = cityMap.get(req.query.city.trim().toLowerCase());

    // City nahi mili to exact match fallback
    if (!customerCity) {
      filter.city = req.query.city;
      const posts = await FullTimeJobPost.find(filter)
        .populate("labourId", "name mobile city profileImage")
        .sort({ createdAt: -1 });
      return sendSuccess(res, 200, "Job posts fetched successfully", { posts });
    }

    // Saare active posts lo, phir 20km filter karo
    const allPosts = await FullTimeJobPost.find(filter)
      .populate("labourId", "name mobile city profileImage")
      .sort({ createdAt: -1 });

    const nearbyPosts = allPosts.filter((post) => {
      if (!post.city) return false;
      const postCity = cityMap.get(post.city.trim().toLowerCase());
      if (!postCity) return false;

      const distance = getDistanceKm(
        customerCity.latitude,
        customerCity.longitude,
        postCity.latitude,
        postCity.longitude
      );
      return distance <= 20;
    });

    return sendSuccess(res, 200, "Job posts fetched successfully", {
      posts: nearbyPosts,
    });
  }

  // City query nahi di to sab dikhao
  const posts = await FullTimeJobPost.find(filter)
    .populate("labourId", "name mobile city profileImage")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Job posts fetched successfully", { posts });
});

// SINGLE POST
const getJobPostById = asyncHandler(async (req, res) => {
  const post = await FullTimeJobPost.findById(req.params.id).populate(
    "labourId",
    "name mobile city profileImage"
  );

  if (!post) {
    return res.status(404).json({ success: false, message: "Job post not found" });
  }

  return sendSuccess(res, 200, "Job post fetched successfully", { post });
});

// CLOSE POST
const closeJobPost = asyncHandler(async (req, res) => {
  const post = await FullTimeJobPost.findOne({
    _id: req.params.id,
    labourId: req.labour._id,
  });

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  post.status = "Closed";
  await post.save();

  return sendSuccess(res, 200, "Job post closed successfully", { post });
});

module.exports = {
  createJobPost,
  getMyJobPosts,
  getJobPosts,
  getJobPostById,
  closeJobPost,
};
