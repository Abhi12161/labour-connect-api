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
      enum: ["Available", "Hired"],
      default: "Available",
    },

    city: String,

    notification: {
      type: String,
      default: "Aap available hain",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LabourRequest",
  labourRequestSchema
);