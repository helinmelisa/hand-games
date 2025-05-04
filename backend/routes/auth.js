/**
 * Defines authentication-related API routes:
 * - User registration
 * - User login
 * - User profile access (protected)
 *
 * Uses authentication middleware to protect private routes.
 */

import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/auth/profile
 * @desc    Get the logged-in user's profile
 * @access  Private (Protected)
 */
router.get("/profile", protect, (req, res) => {
    res.json({
        message: "Welcome to your profile!",
        user: req.user,
    });
});

export default router;
