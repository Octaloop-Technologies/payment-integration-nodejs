const Stripe = require("stripe");
const Withdrawal = require("../models/withdrawal");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const {
  savePayment,
  updatePayment,
} = require("../controllers/paymentController");

const createPaymentIntent = async (req, res, next) => {
  console.log("Route Called")
  try {
    const {
      amount,
      currency = "usd",
      name,
      email,
      type = "Stripe",
      featureType,
    } = req.body;

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      payment_method_types: ["card", "cashapp", "amazon_pay"],
    });

    // Save initial payment details
    const paymentData = {
      paymentId: paymentIntent.id,
      status: "Pending",
      amount,
      currency,
      Name: name,
      Email: email,
      type,
      featureType,
    };

    const { success, message, payment } = await savePayment(paymentData);

    if (!success) {
      return next({ message, error: message });
    }

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

const stripeWebhook = async (req, res, next) => {
  console.log(" Stripe Webhook");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return next({
      type: "StripeSignatureVerificationError",
      message: err.message,
    });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      try {
        await updatePayment(paymentIntent.id, { status: "Completed" });
      } catch (error) {
        return next(error);
      }
      break;
    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object;
      try {
        await updatePayment(failedPaymentIntent.id, { status: "Failed" });
      } catch (error) {
        return next(error);
      }
    default:
      console.log(` Received unhandled event type: ${event.type}`);
  }

  res.status(200).send("Webhook received.");
};

const withdrawToStripeAccount = async (req, res, next) => {
  try {
    const { email, amount, stripeAccountId } = req.body;

    if (!amount || !stripeAccountId) {
      return res.status(400).json({ message: "Missing amount or stripeAccountId." });
    }

    // Stripe requires amount in cents
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // cents
      currency: "usd",
      destination: stripeAccountId,
      transfer_group: `withdrawal_${Date.now()}`,
    });

    // Save withdrawal
    await Withdrawal.create({
      Email: email || "unknown",
      amount,
      stripeTransferId: transfer.id,
      stripeAccountId,
      status: "Pending",
    });

    res.json({
      success: true,
      message: "Transfer sent successfully",
      transferId: transfer.id,
    });
  } catch (err) {
    console.error("Stripe withdrawal error:", err);
    res.status(500).json({ message: "Withdrawal failed", error: err.message });
  }
};



module.exports = {
  createPaymentIntent,
  stripeWebhook,
  withdrawToStripeAccount,
};
