const mongoose = require("mongoose");

const customerJobApplicationSchema =
  new mongoose.Schema(
    {
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerJob",
        required: true,
      },

      labourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Labour",
        required: true,
      },

      message: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Accepted",
          "Rejected",
        ],
        default: "Pending",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "CustomerJobApplication",
  customerJobApplicationSchema
);