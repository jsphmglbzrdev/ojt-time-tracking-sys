import express from "express";
import {
  timeIn,
  timeOut,
  getLogs
} from "../controllers/timeLogController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/time-in", protect, timeIn);
router.post("/time-out", protect, timeOut);
router.get("/logs", protect, getLogs);

export default router;
