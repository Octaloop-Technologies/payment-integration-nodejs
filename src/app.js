const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const paypalRoutes = require("./routes/paypalRoute");
const stripeRoutes = require("./routes/stripeRoutes");
const paystackRoutes = require("./routes/paystackRoutes")
const webHookRoute = require("./routes/webhookRoute");
const adminRoutes = require("./routes/adminRoutes");

const {
  paypalErrorHandler,
  stripeErrorHandler,
} = require("./middleware/ErrorHandler");

const connectDB = require("./db/config");
connectDB();

const app = express();

// Middleware
app.use(cors());

// Error handling middleware
app.use(paypalErrorHandler);
app.use(stripeErrorHandler);

// ✅ Do NOT apply express.json() before the Stripe webhook
app.use("/api", webHookRoute);

// ✅ Now apply JSON parsing for everything else
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Creating test mode api for account id
const Stripe = require("stripe");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-connected-account", async (req, res) => {
  console.log("route called");

  try {
    const account = await stripe.accounts.create({
      type: "express", // or "custom"
      country: "US",   // use a supported country
      email: "rider@example.com", // dummy test email
    });

    res.json({
      message: "Connected account created successfully",
      accountId: account.id, // Save this for later use (e.g., for withdrawals)
    });
  } catch (err) {
    console.error("Error creating connected account:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Other Routes
app.use("/api/paypal", paypalRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/admin", adminRoutes);
// Testing route for account id
app.use("/api/test", router);

module.exports = app;
