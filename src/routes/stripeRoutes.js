const express = require("express");
const {
  createPaymentIntent,
  stripeWebhook,
  withdrawToStripeAccount,
} = require("../controllers/stripeController");

const router = express.Router();

const bodyParser = require("body-parser");

router.post("/payment-intent", createPaymentIntent);
router.post("/webhook/stripe", bodyParser.raw({ type: "application/json"}), stripeWebhook)
router.post("/withdraw", withdrawToStripeAccount);



module.exports = router;
