const Payment = require("../models/payment");

// Function to Save a Payment
const savePayment = async (paymentData) => {
  try {
    console.log("paymentData", paymentData);
    const newPayment = new Payment(paymentData);
    await newPayment.save();
    return {
      success: true,
      message: "Payment saved successfully",
      payment: newPayment,
    };
  } catch (error) {
    console.log(error, "error");
    return {
      success: false,
      message: "Failed to save payment",
      error: error.message,
    };
  }
};

// Function to Update a Payment
const updatePayment = async (paymentId, { status }) => {
  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { paymentId },
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPayment) {
      return { success: false, message: "No payment found with the given id" };
    }
    return {
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update payment",
      error: error.message,
    };
  }
};

// Function to Get All Payments
const getPayments = async () => {
  try {
    const payments = await Payment.find();
    return { success: true, payments };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    };
  }
};

module.exports = { savePayment, getPayments, updatePayment };
