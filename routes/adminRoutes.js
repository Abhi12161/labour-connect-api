const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authenticateAdmin = require("../middlewares/authenticateAdmin");

router.post("/login", adminController.login);

router.use(authenticateAdmin);

router.get("/overview", adminController.getOverview);
router.get("/jobs", adminController.getJobs);
router.get("/applications", adminController.getApplications);
router.get("/requests", adminController.getRequests);

module.exports = router;
