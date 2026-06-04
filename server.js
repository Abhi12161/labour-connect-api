const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const fullTimeCustomerJobRoutes = require(
  "./routes/fullTimeCustomerJobRoutes"
);

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

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/labour", require("./routes/labourRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/job-applications", require("./routes/jobApplicationRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/labour-request", require("./routes/labourRequestRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/cities", require("./routes/cityRoutes"));
app.use(
  "/api/fulltime",require( "./routes/fullTimeProfileRoutes")
);
app.use(
  "/api/fulltime-job-posts",
  require("./routes/fullTimeJobPostRoutes")
);
app.use(
  "/api/hire-requests",
  require("./routes/hireRequestRoutes")
);
app.use(
  "/api/customer-jobs",
  require("./routes/customerJobRoutes")
);

app.use(
  "/api/customer-job-applications",
  require(
    "./routes/customerJobApplicationRoutes"
  )
);


app.use(
  "/api/fulltime-customer-jobs",
  fullTimeCustomerJobRoutes
);


app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:");
    console.error(err);
    process.exit(1);
  }
};

startServer();