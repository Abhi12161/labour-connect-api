const { body, param } = require("express-validator");

const mobileValidator = body("mobile")
  .trim()
  .matches(/^[0-9]{10}$/)
  .withMessage("Mobile number must be exactly 10 digits");

const optionalMobileValidator = body("mobile")
  .optional()
  .trim()
  .matches(/^[0-9]{10}$/)
  .withMessage("Mobile number must be exactly 10 digits");

const optionalProfileImageValidator = body("profileImage")
  .optional()
  .trim()
  .custom((value) => {
    if (!value) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch (error) {
      throw new Error("Profile image must be a valid URL");
    }
  });

const signupValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  mobileValidator,
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("bio").optional().trim(),
  optionalProfileImageValidator,
];

const loginValidator = [mobileValidator];

const updateProfileValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  optionalMobileValidator,
  body("address").optional().trim().notEmpty().withMessage("Address cannot be empty"),
  body("bio").optional().trim(),
  optionalProfileImageValidator,
];

const addSkillValidator = [
  body("name").trim().notEmpty().withMessage("Skill name is required"),
  body("experienceYears")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Experience years must be 0 or more"),
  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Level must be beginner, intermediate, advanced or expert"),
  body("notes").optional().trim(),
];

const updateSkillValidator = [
  param("skillId").isMongoId().withMessage("Skill id is invalid"),
  body("name").optional().trim().notEmpty().withMessage("Skill name cannot be empty"),
  body("experienceYears")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Experience years must be 0 or more"),
  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Level must be beginner, intermediate, advanced or expert"),
  body("notes").optional().trim(),
];

const deleteSkillValidator = [
  param("skillId").isMongoId().withMessage("Skill id is invalid"),
];

module.exports = {
  signupValidator,
  loginValidator,
  updateProfileValidator,
  addSkillValidator,
  updateSkillValidator,
  deleteSkillValidator,
};
