const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, unique: true },
  address: String,
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);