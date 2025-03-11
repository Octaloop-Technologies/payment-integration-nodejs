const express = require("express");
const {
  createPaymentIntent,
  getSecret,
  createCheckoutSession,
} = require("../controllers/stripeController");

const router = express.Router();
router.post("/checkout-session", createCheckoutSession);

module.exports = router;
