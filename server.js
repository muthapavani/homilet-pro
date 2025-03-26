const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config(); 

const app = express();
app.use(cors());
app.use(express.json());

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; 

// Database Connection Pool
const pool = mysql.createPool({
  host: "my-db.c9w6ssg6i83x.eu-north-1.rds.amazonaws.com",
  user: "pavani",
  password: "12345678",
  database: "homilet",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Error Handling Utility
const handleDatabaseError = (res, error, defaultMessage = "An error occurred") => {
  console.error("Database Error:", error);
  res.status(500).json({ 
    success: false, 
    message: defaultMessage,
    error: error.message 
  });
};

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "muttapavani9@gmail.com",
    pass: "chfa vwoa cfhu xsyw",
  },
});

// Temporary OTP Store
const otpStore = {};

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Middleware to Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(403).json({ error: "Access denied, token missing!" });
    }

    const token = authHeader.split(" ")[1]; // Expecting "Bearer <token>"
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // If guest account, check if expired
    if (decoded.isGuest) {
      const [rows] = await pool.execute(
        "SELECT * FROM user1 WHERE id = ? AND is_guest = TRUE AND guest_expiry_date > NOW()",
        [decoded.userId]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "Guest session expired" });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token!" });
  }
};

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    const connection = await pool.getConnection();
    try {
      // Check existing user
      const [existingUsers] = await connection.execute(
        "SELECT * FROM user1 WHERE email = ?", 
        [email]
      );

      if (existingUsers.length > 0) {
        connection.release();
        return res.status(409).json({ 
          success: false, 
          message: "Email already registered" 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      await connection.execute(
        "INSERT INTO user1 (name, email, password, is_guest) VALUES (?, ?, ?, FALSE)", 
        [name, email, hashedPassword]
      );

      connection.release();
      res.status(201).json({ 
        success: true, 
        message: "User registered successfully" 
      });

    } catch (dbError) {
      connection.release();
      handleDatabaseError(res, dbError, "Database registration error");
    }
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute("SELECT * FROM user1 WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ error: "You don't have an account. Please sign up." });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email,
        isGuest: user.is_guest || false 
      }, JWT_SECRET, { expiresIn: "1h" });

      return res.json({
        success: true,
        message: "Login successful!",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isGuest: user.is_guest || false
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    handleDatabaseError(res, error, "Login process error");
  }
});

// Guest Login Route
app.post("/guest-login", async (req, res) => {
  try {
    // Generate a random guest username and name
    const guestUsername = `guest_${Math.floor(100000 + Math.random() * 900000)}@guest.com`;
    const guestName = `Guest User`;
    
    // Create expiry date (24 hours from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    const mysqlDatetime = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

    const connection = await pool.getConnection();
    try {
      // Insert guest user into the user1 table
      const [result] = await connection.execute(
        "INSERT INTO user1 (name, email, is_guest, guest_expiry_date) VALUES (?, ?, TRUE, ?)",
        [guestName, guestUsername, mysqlDatetime]
      );

      // Get the newly created user ID
      const userId = result.insertId;

      // Generate JWT token for the guest user
      const token = jwt.sign(
        { userId: userId, email: guestUsername, isGuest: true },
        JWT_SECRET,
        { expiresIn: "4h" }
      );

      connection.release();
      return res.json({
        success: true,
        message: "Guest login successful!",
        token,
        user: {
          id: userId,
          name: guestName,
          email: guestUsername,
          isGuest: true
        }
      });
    } catch (dbError) {
      connection.release();
      handleDatabaseError(res, dbError, "Error creating guest account");
    }
  } catch (error) {
    handleDatabaseError(res, error, "Server error during guest login");
  }
});

// Cleanup Expired Guest Accounts
async function cleanupExpiredGuestAccounts() {
  try {
    const [result] = await pool.execute(
      "DELETE FROM user1 WHERE is_guest = TRUE AND guest_expiry_date < NOW()"
    );
    console.log(`Removed ${result.affectedRows} expired guest accounts`);
  } catch (error) {
    console.error("Error cleaning up guest accounts:", error);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredGuestAccounts, 60 * 60 * 1000);

// Protected Route Example
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: "Welcome to the dashboard!", user: req.user });
});

// Forgot Password - Send OTP
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.execute("SELECT * FROM user1 WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    const mailOptions = {
      from: "muttapavani@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully. Check your email." });
  } catch (error) {
    handleDatabaseError(res, error, "Error sending OTP");
  }
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) {
    return res.status(400).json({ error: "No OTP found. Request a new OTP." });
  }

  if (Date.now() > otpStore[email].expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired. Request a new one." });
  }

  if (otpStore[email].otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  otpStore[email].verified = true;
  res.json({ message: "OTP verified successfully." });
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!otpStore[email]?.verified) {
      return res.status(400).json({ error: "OTP verification required before resetting password." });
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await pool.execute("UPDATE user1 SET password = ? WHERE email = ?", [hashedPassword, email]);

    delete otpStore[email]; // Clear OTP store after successful reset
    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    handleDatabaseError(res, error, "Password reset error");
  }
});

// Start Server
const PORT = 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await pool.end();
  process.exit(0);
});