const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const {
  savePayment,
  updatePayment,
} = require("../controllers/paymentController");

const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = "usd" } = req.body;

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      payment_method_types: ["card", "cashapp", "amazon_pay"],
    });

    // Save initial payment details
    await savePayment({
      paymentId: paymentIntent.id,
      status: "Pending",
      amount,
      currency,
      type: "Stripe",
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

const stripeWebhook = async (req, res, next) => {
  console.log("📩 Inside Stripe Webhook");

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

    default:
      console.log(`ℹ️  Received unhandled event type: ${event.type}`);
  }

  res.status(200).send("Webhook received.");
};

module.exports = {
  createPaymentIntent,
  stripeWebhook,
};
