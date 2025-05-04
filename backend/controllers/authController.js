/**
 * Controller functions for user authentication:
 * - User registration
 * - User login
 *
 * Handles validation, password hashing, token generation, and proper HTTP responses.
 */

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * generateToken
 *
 * Generates a JWT token for a given user ID.
 *
 * @param {string} id - MongoDB user ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

/**
 * registerUser
 *
 * Registers a new user:
 * - Validates input fields.
 * - Checks for existing user with the same email.
 * - Hashes the password.
 * - Creates a new user in the database.
 * - Returns user data and token on success.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        res.status(400).json({ message: "Please add all fields" });
        return;
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: "User already exists" });
        return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    // Respond with user info and token
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

/**
 * loginUser
 *
 * Logs in an existing user:
 * - Validates email and password.
 * - Checks if user exists and passwords match.
 * - Returns user data and token on success.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Validate password
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
};
