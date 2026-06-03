const mongoose = require("mongoose");

const fullTimeJobPostSchema = new mongoose.Schema(
  {
    labourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labour",
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    experience: {
      type: Number,
      default: 0,
    },

    expectedSalary: {
      type: Number,
      default: 0,
    },

    city: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FullTimeJobPost",
  fullTimeJobPostSchema
);