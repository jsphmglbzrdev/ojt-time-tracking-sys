import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    requiredHours: { type: Number, default: 400 },
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
