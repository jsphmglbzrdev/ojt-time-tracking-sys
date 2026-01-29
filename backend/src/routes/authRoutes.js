import express from "express";
import { register, login, forgotPassword, resetPassword, getCurrentUser, updateRequiredHours } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/me", protect, getCurrentUser);
router.patch("/required-hours", protect, updateRequiredHours);

export default router;