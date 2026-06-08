// models/City.js

const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    block: String,
    district: String,
    state: String,
    latitude: Number,
    longitude: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("City", citySchema);