/**
 * Service module to handle user authentication-related API requests:
 * - Login
 * - Register
 * - Logout
 * - Get current logged-in user
 *
 * Uses Axios for HTTP requests.
 */

import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/"; // Base URL for auth API endpoints

/**
 * login
 *
 * Sends user credentials to the server to log in.
 *
 * @param {Object} userData - { email, password }
 * @returns {Promise<Object>} User data including token if successful
 */
const login = async (userData) => {
    const response = await axios.post(API_URL + "login", userData);
    return response.data;
};

/**
 * register
 *
 * Sends new user data to the server to create an account.
 *
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} User data including token if successful
 */
const register = async (userData) => {
    const response = await axios.post(API_URL + "register", userData);
    return response.data;
};

/**
 * logout
 *
 * Logs out the current user by removing their info from localStorage.
 */
const logout = () => {
    localStorage.removeItem("user");
};

/**
 * getCurrentUser
 *
 * Retrieves the currently logged-in user's data from localStorage.
 *
 * @returns {Object|null} Parsed user object if found, otherwise null
 */
const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

// Export all auth-related methods
const authService = {
    login,
    register,
    logout,
    getCurrentUser,
};

export default authService;
