const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Use a strong secret in .env

// Database Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "pro",
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// **Nodemailer Setup**
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:"muttapavani9@gmail.com ", // Set in .env
    pass: "chfa vwoa cfhu xsyw", // Set in .env
  },
});

// Temporary OTP Store
const otpStore = {};

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// **📌 Signup Route**
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  connection.query("SELECT * FROM hom WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error occurred" });

    if (result.length > 0) {
      return res.status(400).json({ error: "You already have an account. Please log in." });
    }

    // Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    connection.query(
      "INSERT INTO hom (name, email, password) VALUES (?, ?, ?)", 
      [name, email, hashedPassword], 
      (err) => {
        if (err) return res.status(500).json({ error: "Database error" });

        return res.status(201).json({ success: true, message: "User registered successfully" });
      }
    );
  });
});

// **📌 Login Route (JWT Authentication)**
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  connection.query("SELECT * FROM hom WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error occurred" });

    if (result.length === 0) {
      return res.status(404).json({ error: "You don’t have an account. Please sign up." });
    }

    const storedPassword = result[0].password;
    const match = await bcrypt.compare(password, storedPassword);

    if (match) {
      const token = jwt.sign({ userId: result[0].id, email: result[0].email }, JWT_SECRET, { expiresIn: "1h" });

      return res.json({
        success: true,
        message: "Login successful!",
        token,
        user: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  });
});

// **🔐 Middleware to Verify JWT Token**
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ error: "Access denied, token missing!" });
  }

  const token = authHeader.split(" ")[1]; // Expecting "Bearer <token>"
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token!" });
    req.user = decoded;
    next();
  });
};

// **🔒 Protected Route Example**
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: "Welcome to the dashboard!", user: req.user });
});

// **📌 1️⃣ Forgot Password - Send OTP**
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  connection.query("SELECT * FROM hom WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    const mailOptions = {
      from: "muttapavani@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ error: "Error sending OTP" });
      res.json({ message: "OTP sent successfully. Check your email." });
    });
  });
});

// **📌 2️⃣ Verify OTP**
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) return res.status(400).json({ error: "No OTP found. Request a new OTP." });

  if (Date.now() > otpStore[email].expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired. Request a new one." });
  }

  if (otpStore[email].otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  otpStore[email].verified = true;
  res.json({ message: "OTP verified successfully." });
});

// **📌 3️⃣ Reset Password**
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!otpStore[email]?.verified) {
    return res.status(400).json({ error: "OTP verification required before resetting password." });
  }

  // Hash and update the password
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  connection.query("UPDATE hom SET password = ? WHERE email = ?", [hashedPassword, email], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    delete otpStore[email]; // Clear OTP store after successful reset
    res.json({ message: "Password reset successfully!" });
  });
});

// **Start Server**
const PORT = 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
