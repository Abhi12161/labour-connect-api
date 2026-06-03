const mongoose = require("mongoose");

const hireRequestSchema = new mongoose.Schema(
  {
    jobPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FullTimeJobPost",
      required: true,
    },

    labourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labour",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "HireRequest",
  hireRequestSchema
);