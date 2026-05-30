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

const assignmentHistorySchema = new mongoose.Schema(
  {
    labour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labour",
      default: null,
    },
    previousLabour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labour",
      default: null,
    },
    assignedByRole: {
      type: String,
      enum: ["Admin", "Customer", "System"],
      default: "Admin",
    },
    assignedBy: {
      name: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      mobile: { type: String, trim: true, default: "" },
    },
    action: {
      type: String,
      enum: ["Assigned", "Reassigned", "Removed"],
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
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
    requiredDate: { type: Date, default: null },
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
    assignmentHistory: {
      type: [assignmentHistorySchema],
      default: [],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    requiredLabours: {
      type: Number,
      default: 1,
    },

    hiredCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
