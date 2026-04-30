const Labour = require("../models/Labour");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");

const getProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, "Profile fetched successfully", {
    labour: req.labour,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (req.body.mobile && req.body.mobile !== req.labour.mobile) {
    const existingLabour = await Labour.findOne({
      mobile: req.body.mobile,
      _id: { $ne: req.labour._id },
    });

    if (existingLabour) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already in use",
      });
    }
  }

  const allowedFields = ["name", "mobile", "address", "bio", "profileImage"];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      req.labour[field] = req.body[field];
    }
  }

  await req.labour.save();

  return sendSuccess(res, 200, "Profile updated successfully", {
    labour: req.labour,
  });
});

const addSkill = asyncHandler(async (req, res) => {
  const { name, experienceYears, level, notes } = req.body;

  req.labour.skills.push({
    name,
    experienceYears,
    level,
    notes,
  });

  await req.labour.save();

  return sendSuccess(res, 201, "Skill added successfully", {
    labour: req.labour,
  });
});

const updateSkill = asyncHandler(async (req, res) => {
  const skill = req.labour.skills.id(req.params.skillId);

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: "Skill not found",
    });
  }

  const allowedFields = ["name", "experienceYears", "level", "notes"];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      skill[field] = req.body[field];
    }
  }

  await req.labour.save();

  return sendSuccess(res, 200, "Skill updated successfully", {
    labour: req.labour,
  });
});

const deleteSkill = asyncHandler(async (req, res) => {
  const skill = req.labour.skills.id(req.params.skillId);

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: "Skill not found",
    });
  }

  skill.deleteOne();
  await req.labour.save();

  return sendSuccess(res, 200, "Skill deleted successfully", {
    labour: req.labour,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  addSkill,
  updateSkill,
  deleteSkill,
};
