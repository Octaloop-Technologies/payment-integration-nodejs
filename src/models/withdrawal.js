const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    Email: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    stripeTransferId: {
      type: String,
      required: true,
    },
    stripeAccountId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
module.exports = Withdrawal;
