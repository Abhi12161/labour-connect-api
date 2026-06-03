const mongoose = require("mongoose");

const fullTimeProfileSchema = new mongoose.Schema(
  {
    labourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labour",
      required: true,
      unique: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    expectedSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    availability: {
      type: String,
      default: "Available Immediately",
      trim: true,
    },

    education: {
      type: String,
      default: "",
      trim: true,
    },

    aboutMe: {
      type: String,
      default: "",
      trim: true,
    },

    profileStatus: {
      type: String,
      enum: ["Draft", "Active"],
      default: "Draft",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model(
  "FullTimeProfile",
  fullTimeProfileSchema
);