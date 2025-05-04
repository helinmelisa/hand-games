/**
 * Mongoose model for storing user information.
 *
 * Each user has a name, email, and hashed password.
 * Automatically records creation and update timestamps.
 */

import mongoose from "mongoose";

// Define User Schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true, // Email must be unique across all users
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create User model
const User = mongoose.model("User", userSchema);

export default User;
