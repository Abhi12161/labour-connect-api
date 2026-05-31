const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("=================================");
    console.log("DB_NAME:", process.env.DB_NAME);
    console.log("MONGO_URI:", process.env.MONGO_URI);
    console.log("=================================");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
    });

    console.log("✅ Mongo Connected");

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected event");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("❌ MongoDB disconnected! Reconnecting in 5s...");
      setTimeout(() => connectDB(), 5000);
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected!");
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(err);
    console.log("Retrying in 5 seconds...");
    setTimeout(() => connectDB(), 5000);
  }
};

module.exports = connectDB;