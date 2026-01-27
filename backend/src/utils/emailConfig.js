import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * NODEMAILER TRANSPORTER SETUP
 * Configure your email service credentials in .env file
 */
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * VERIFY TRANSPORTER CONNECTION
 */
transporter.verify((error, success) => {
  if (error) {
    console.log("Email config error:", error);
  } else {
    console.log("✓ Email service is ready");
  }
});

/**
 * SEND PASSWORD RESET EMAIL
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} frontendURL - Frontend URL for reset link
 */
export const sendPasswordResetEmail = async (email, resetToken, frontendURL) => {
  try {
    const resetLink = `${frontendURL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - OJT Tracking System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px;">
              We received a request to reset your password for your OJT Tracking System account.
            </p>
          </div>

          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Click the button below to reset your password. This link will expire in 1 hour.
          </p>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetLink}" style="
              background-color: #007bff;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
              font-size: 16px;
              font-weight: bold;
            ">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="background-color: #f0f0f0; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>

          <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request a password reset, please ignore this email or contact support if you have questions.
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © OJT Tracking System. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Reset email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send reset email");
  }
};

/**
 * SEND SUCCESS EMAIL
 * Sent after password has been successfully reset
 */
export const sendPasswordResetSuccessEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Successful - OJT Tracking System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #155724; margin-top: 0;">✓ Password Changed Successfully</h2>
          </div>

          <p style="color: #333; font-size: 16px;">
            Hello ${fullName},
          </p>

          <p style="color: #666; font-size: 16px;">
            Your password has been successfully reset. You can now log in with your new password.
          </p>

          <p style="color: #666; font-size: 16px;">
            If you didn't make this change, please contact us immediately.
          </p>

          <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © OJT Tracking System. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending success email:", error);
  }
};

export default transporter;
