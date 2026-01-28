import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail } from "../utils/emailConfig.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ match JWT
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};


/**
 * REGISTER
 */
export const register = async (req, res) => {
  try {
    const {
      fullName,
      institution,
      email,
      password,
      requiredHours
    } = req.body;

    if (!fullName || !institution || !email || !password) {
      return res.status(400).json({
        message: "All required fields must be filled"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      institution,
      email,
      password: hashedPassword,
      requiredHours: requiredHours || 400
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        institution: user.institution,
        email: user.email,
        requiredHours: user.requiredHours
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        institution: user.institution,
        requiredHours: user.requiredHours
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};


/**
 * FORGOT PASSWORD
 * Generate reset token and send email
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Security: Don't reveal if email exists or not
      return res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiry (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send email
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    await sendPasswordResetEmail(email, resetToken, frontendURL);

    res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Error processing forgot password request",
      error: error.message
    });
  }
};

/**
 * RESET PASSWORD
 * Verify token and update password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate inputs
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Hash the token to match the stored hash
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    // Send success email
    await sendPasswordResetSuccessEmail(user.email, user.fullName);

    res.status(200).json({
      message: "Password reset successful. Please log in with your new password"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({

      message: "Error resetting password",
      error: error.message
    });
  }
};
