const express = require("express");
const {
  adminLogin,
  forgotPassword,
  verifyOTP,
  updatePassword,
  createAdmin
} = require("../controllers/adminController");

const router = express.Router();

// Admin API Routes
router.post("/create-admin", createAdmin)
router.post("/login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/update-password", updatePassword);

module.exports = router; 