const mongoose = require("mongoose");

const labourRequestSchema = new mongoose.Schema(
  {
    labour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labour",
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "Hired", "Accepted", "Cancelled"],
      default: "Available",
    },

    city: {
      type: String,
      default: "",
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    workDetails: {
      location: {
        type: String,
        default: "",
      },
      timing: {
        type: String,
        default: "",
      },
      notes: {
        type: String,
        default: "",
      },
      customerName: {
        type: String,
        default: "",
      },
      customerMobile: {
        type: String,
        default: "",
      },
    },

    notification: {
      type: String,
      default: "Aap available hain",
    },
    expiresAt: {
      type: Date,

      default: () =>
        new Date(Date.now() + 24 * 60 * 60 * 1000),
    },

    labourNotifications: {
      type: [String],
      default: [],
    },

    customerNotifications: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LabourRequest",
  labourRequestSchema
);
