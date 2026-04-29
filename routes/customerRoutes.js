const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Signup
router.post("/signup", async (req, res) => {
  const { name, mobile, address } = req.body;

  const existing = await Customer.findOne({ mobile });
  if (existing) return res.status(400).json({ msg: "Already registered" });

  const user = await Customer.create({ name, mobile, address });
  res.json(user);
});

// Login
router.post("/login", async (req, res) => {
  const { mobile } = req.body;

  const user = await Customer.findOne({ mobile });

  if (!user) return res.status(400).json({ msg: "User not found" });

  res.json(user);
});

module.exports = router;