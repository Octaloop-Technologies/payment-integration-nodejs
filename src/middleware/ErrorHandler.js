const paypal = require("@paypal/paypal-server-sdk");


const paypalErrorHandler = (err, req, res, next) => {
  console.log("🚨 Error:", err);

  if (err instanceof paypal.ApiError) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal Server Error" });
};

const stripeErrorHandler = (err, req, res, next) => {
  console.log("🚨 Error:", err);

  if (err.type === "StripeInvalidRequestError") {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.type === "StripeSignatureVerificationError") {
    return res
      .status(400)
      .json({ success: false, error: "Invalid webhook signature." });
  }

  res
    .status(err.status || 500)
    .json({ success: false, error: err.message || "Something went wrong." });
};

module.exports = {
  paypalErrorHandler,
  stripeErrorHandler,
};
