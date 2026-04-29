const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const envPath = path.resolve(process.cwd(), ".env");
const localEnvPath = path.resolve(process.cwd(), ".env.local");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
  console.log("Using fallback env file: .env.local");
} else {
  dotenv.config();
}

const app = express();


// ✅ STRONG CORS FIX (IMPORTANT)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Preflight handle


app.use(express.json());

connectDB();

app.use("/api/labour", require("./routes/labourRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});