/**
 * Main Express application configuration:
 * - Loads environment variables
 * - Sets up CORS and JSON body parsing
 * - Mounts authentication
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.use("/api/auth", authRoutes); // Authentication routes

export default app;
