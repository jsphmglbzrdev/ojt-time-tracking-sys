import express from "express";
import {
  timeIn,
  timeOut,
  getLogs,
  deleteLog
} from "../controllers/timeLogController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/time-in", protect, timeIn);
router.post("/time-out", protect, timeOut);
router.get("/logs", protect, getLogs);
router.delete("/log/:logId", protect, deleteLog);

export default router;
