const mongoose = require("mongoose");

const labourSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, unique: true },
  address: String,
}, { timestamps: true });

module.exports = mongoose.model("Labour", labourSchema);