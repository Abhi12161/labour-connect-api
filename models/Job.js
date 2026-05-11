const mongoose = require("mongoose");

const updateHistorySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    updatedByRole: {
      type: String,
      enum: ["Customer", "System"],
      default: "Customer",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    skill: { type: String, required: true },
    description: { type: String },
    city: { type: String },
    location: { type: String },
    timing: { type: String },
    level: { type: String },
    status: {
      type: String,
      enum: ["Open", "Assigned", "Accepted", "Cancelled", "Completed"],
      default: "Open",
    },
    assignedLabour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labour",
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
    updateHistory: {
      type: [updateHistorySchema],
      default: [],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
