const { body } = require("express-validator");

const mobileValidator = body("mobile")
  .trim()
  .matches(/^[0-9]{10}$/)
  .withMessage("Mobile number must be exactly 10 digits");

const signupValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  mobileValidator,
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("bio").optional().trim(),
  body("profileImage")
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
    }),
];

const loginValidator = [mobileValidator];

const updateProfileValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("mobile")
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("Mobile number must be exactly 10 digits"),
  body("address").optional().trim().notEmpty().withMessage("Address cannot be empty"),
  body("bio").optional().trim(),
  body("profileImage")
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
    }),
];

module.exports = {
  signupValidator,
  loginValidator,
  updateProfileValidator,
};
