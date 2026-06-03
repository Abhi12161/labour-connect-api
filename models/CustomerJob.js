const mongoose = require("mongoose");

const customerJobSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    title: {
      type: String,
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

    salary: {
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
  "CustomerJob",
  customerJobSchema
);