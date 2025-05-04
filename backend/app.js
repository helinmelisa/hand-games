/**
 * Main Express application configuration:
 * - Loads environment variables
 * - Sets up CORS and JSON body parsing
 * - Mounts authentication and score routes
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import scoreRoutes from "./routes/scores.js";

dotenv.config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/scores", scoreRoutes); // Score management routes

export default app;
