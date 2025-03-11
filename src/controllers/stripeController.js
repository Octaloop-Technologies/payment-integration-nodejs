const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const {
  savePayment,
  updatePayment,
} = require("../controllers/paymentController");

const createCheckoutSession = async (req, res, next) => {
  try {
    const { amount, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "cashapp", "klarna", "amazon_pay"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Your Product Name" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || process.env.SUCESS_URL_STRIPE,
      cancel_url: cancelUrl || process.env.FAIL_URL_STRIPE,
    });

    await savePayment({
      paymentId: session.id,
      status: "Pending",
      amount,
      currency: "usd",
      type: "Stripe",
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
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
    case "checkout.session.completed":
      const session = event.data.object;
      try {
        await updatePayment(session.id, { status: "Completed" });
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
  createCheckoutSession,
  stripeWebhook,
};
