const express = require("express");
const router = express.Router();

const Labour = require("../models/Labour");

// Signup
router.post("/signup", async (req, res) => {
  console.log("HIT SIGNUP"); // 👈 debug

  const { name, mobile, address } = req.body;

  const existing = await Labour.findOne({ mobile });
  if (existing) return res.status(400).json({ msg: "Already registered" });

  const user = await Labour.create({ name, mobile, address });
  res.json(user);
});

// Login
router.post("/login", async (req, res) => {
  const { mobile } = req.body;

  const user = await Labour.findOne({ mobile });

  if (!user) return res.status(400).json({ msg: "User not found" });

  res.json(user);
});

module.exports = router;