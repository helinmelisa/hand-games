/**
 * Defines API routes for managing user game scores:
 * - Save a new score
 * - Get all scores of the logged-in user
 *
 * All routes are protected with authentication middleware.
 */

import express from "express";
import Score from "../models/Score.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

/**
 * @route   POST /api/scores
 * @desc    Save a new game score for the logged-in user
 * @access  Private
 */
router.post("/", async (req, res) => {
    const { score, gameType } = req.body;

    // Validate input
    if (typeof score !== "number" || !gameType) {
        return res.status(400).json({ message: "Score and gameType are required." });
    }

    try {
        const newScore = await Score.create({
            user: req.user._id,
            score,
            gameType,
        });
        res.status(201).json(newScore);
    } catch (err) {
        res.status(400).json({ message: "Failed to save score.", error: err.message });
    }
});

/**
 * @route   GET /api/scores
 * @desc    Get all game scores for the logged-in user
 * @access  Private
 */
router.get("/", async (req, res) => {
    try {
        const scores = await Score.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch scores.", error: err.message });
    }
});

export default router;
