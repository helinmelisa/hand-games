/**
 * Entry point for the Express server.
 * - Connects to MongoDB.
 * - Starts the Express app on the specified port.
 */

import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const PORT = process.env.PORT || 8080;
console.log("Connecting to MongoDB:", process.env.MONGO_URI);


// Connect to database, then start server
connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
