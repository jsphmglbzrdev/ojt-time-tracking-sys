import TimeLog from "../models/TimeLog.js";
/**
 * TIME IN
 */
export const timeIn = async (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().split("T")[0];

  const existing = await TimeLog.findOne({
    user: userId,
    date: today
  });	

  if (existing) {
    return res.status(400).json({
      message: "Already timed in today"
    });
  }

  const log = await TimeLog.create({
    user: userId,
    date: today,
    timeIn: new Date()
  });

  res.status(201).json(log);
};

/**
 * TIME OUT
 */
export const timeOut = async (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().split("T")[0];

  const log = await TimeLog.findOne({
    user: userId,
    date: today
  });

  if (!log || log.timeOut) {
    return res.status(400).json({
      message: "No active time-in"
    });
  }

  log.timeOut = new Date();

  const diffMs = log.timeOut - log.timeIn;
  log.totalHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);

  await log.save();
  res.json(log);
};

/**
 * GET LOGS (CURRENT USER ONLY)
 */
export const getLogs = async (req, res) => {
  const userId = req.user.userId;

  const logs = await TimeLog.find({ user: userId })
    .sort({ date: -1 });

  res.json(logs);
};

/**
 * DELETE LOG
 */
export const deleteLog = async (req, res) => {
  const userId = req.user.userId;
  const { logId } = req.params;

  const log = await TimeLog.findOne({ _id: logId, user: userId });

  if (!log) {
    return res.status(404).json({
      message: "Log not found"
    });
  }

  await TimeLog.findByIdAndDelete(logId);
  res.json({ message: "Log deleted successfully" });
};
