/**
 * Utility function to connect to MongoDB using Mongoose.
 * Loads environment variables with dotenv.
 *
 * Main Features:
 * - Connects to the MongoDB URI from environment variables.
 * - Logs successful connection.
 * - Handles connection errors and exits the process if connection fails.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * connectDB
 *
 * Establishes a connection to the MongoDB database.
 *
 * @returns {Promise<void>} Resolves when connection is successful, exits process if failed.
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed", error.message);
        process.exit(1); // Exit the server with a failure code
    }
};

export default connectDB;
