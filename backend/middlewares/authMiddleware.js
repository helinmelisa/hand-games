/**
 * Middleware to protect private routes by verifying JWT tokens.
 *
 * Main Features:
 * - Extracts the token from Authorization header.
 * - Verifies and decodes the token.
 * - Attaches the authenticated user to the request object.
 * - Denies access if no valid token is provided.
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes and authenticate users.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from "Authorization" header
            token = req.headers.authorization.split(" ")[1];

            // Verify token and decode it
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user attached to the decoded token ID, exclude password
            req.user = await User.findById(decoded.id).select("-password");

            next(); // Pass to the next middleware or route handler
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export { protect };
