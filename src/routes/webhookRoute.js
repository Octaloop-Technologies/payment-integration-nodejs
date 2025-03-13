const express = require("express");
const { stripeWebhook } = require("../controllers/stripeController");

const router = express.Router();

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

router.get(
  "/stripe/webhook",
  (req, res) => {
    res.send("Here return something");
  }
);

module.exports = router;
