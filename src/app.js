const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const paypalRoutes = require("./routes/paypalRoute");
const stripeRoutes = require("./routes/stripeRoutes");
const webHookRoute = require("./routes/webhookRoute");

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

// Other Routes
app.use("/api/paypal", paypalRoutes);
app.use("/api/stripe", stripeRoutes);

module.exports = app;
