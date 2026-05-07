const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,

      enum: [
        "Applied",
        "Assigned",
        "Hired",
        "Accepted",
        "Cancelled",
        "Updated",
        "StatusChanged",
      ],

      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // 👇 unread support
    isRead: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    _id: true,
  }
);

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    labour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labour",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    status: {
      type: String,
      enum: ["Applied", "Assigned", "Hired", "Accepted", "Cancelled", "Rejected"],
      default: "Applied",
    },

    labourNotification: {
      type: String,
      default: "",
    },

    customerNotification: {
      type: String,
      default: "",
    },

    labourNotifications: {
      type: [notificationSchema],
      default: [],
    },

    customerNotifications: {
      type: [notificationSchema],
      default: [],
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);
