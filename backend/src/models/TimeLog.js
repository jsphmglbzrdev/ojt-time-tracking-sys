import mongoose from "mongoose";

const TimeLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    timeIn: {
      type: Date,
      required: true
    },
    timeOut: Date,
    totalHours: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("TimeLog", TimeLogSchema);
