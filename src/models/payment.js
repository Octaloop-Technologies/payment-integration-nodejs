const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Card",
        "PayPal",
        "Crypto",
        "Cash App",
        "Amazon Pay",
        "Google Pay",
        "Apple Pay",
        "Stripe",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Completed",
        "Failed",
        "Refunded",
        "CREATED",
        "COMPLETED",
      ],
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
    },
    featureType: {
      type: String,
      required: true,
      enum: ["RidePayments", "WatchToEarn", "SendMoneyFees"],
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
