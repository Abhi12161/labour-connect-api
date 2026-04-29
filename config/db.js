const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected:", process.env.DB_NAME);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
