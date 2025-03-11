const express = require("express");
const {
  createOrder,
  captureOrder,
} = require("../controllers/paypalController");

const router = express.Router();

// PayPal API Routes
router.post("/orders", createOrder);
router.post("/orders/:orderID/capture", captureOrder);

// Test route
router.get("/", (req, res) => {
  res.send("Welcome to the PayPal API");
});

module.exports = router;
