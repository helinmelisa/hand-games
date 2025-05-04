/**
 * Mongoose model for storing game scores.
 *
 * Each score is linked to a user and a game type.
 * Automatically records creation and update timestamps.
 */

import mongoose from "mongoose";

// Define Score Schema
const scoreSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // References the User model
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        gameType: {
            type: String,
            required: true,
            enum: ["BallGame", "SimonSays", "ShapeTracing", "MemoryMatch", "SwipeChallenge", "QuickReaction"], // List of valid game types
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create Score model
const Score = mongoose.model("Score", scoreSchema);

export default Score;
