const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

let otp; // Variable to store OTP temporarily

// Admin Login
const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  otp = Math.floor(100000 + Math.random() * 900000); // Generate OTP

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Error sending email" });
    }
    res.json({ message: "OTP sent to email" });
  });
};

// Verify OTP
const verifyOTP = (req, res) => {
  const { inputOtp } = req.body;

  if (inputOtp === otp.toString()) {
    return res.json({ message: "OTP verified" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
};

// Update Password
const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  admin.password = newPassword;
  await admin.save();

  res.json({ message: "Password updated successfully" });
};

// Create Admin
const createAdmin = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully!" });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Error creating admin" });
  }
};

module.exports = {
  adminLogin,
  forgotPassword,
  verifyOTP,
  updatePassword,
  createAdmin,
};
