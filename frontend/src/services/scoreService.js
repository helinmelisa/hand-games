/**
 * Service module to handle score-related API requests:
 * - Save a new score
 * - Retrieve existing scores
 *
 * Uses Axios for HTTP requests.
 * Automatically attaches the user's token from localStorage.
 */

import axios from "axios";

const API_URL = "/api/scores"; // Base URL for score endpoints

/**
 * saveScore
 *
 * Saves a new game score to the server.
 *
 * @param {number} score - The achieved score
 * @param {string} gameType - Type of the game (e.g., "BallGame", "SimonSays")
 * @returns {Promise<Object>} Saved score data from the server
 */
const saveScore = async (score, gameType) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const res = await axios.post(
        API_URL,
        { score, gameType },
        {
            headers: { Authorization: `Bearer ${user.token}` }
        }
    );
    return res.data;
};

/**
 * getScores
 *
 * Fetches all scores for the current user from the server.
 *
 * @returns {Promise<Array>} List of score objects
 */
const getScores = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${user.token}` }
    });
    return res.data;
};

// Export all score-related methods
export default { saveScore, getScores };
