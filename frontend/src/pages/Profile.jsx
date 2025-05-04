/**
 * This component displays the user's profile after login.
 * It shows:
 * - User welcome message
 * - Highest scores and all recorded scores for each game
 * - Buttons to play each available game
 *
 * Main Features:
 * - Fetches user info from localStorage.
 * - Fetches scores from the server.
 * - Redirects to login if user is not authenticated.
 * - Displays scores grouped by game type.
 * - Provides quick navigation to games.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import scoreService from "../services/scoreService";
import { toast } from "react-toastify";
import { FaBasketballBall, FaBrain, FaHandPaper, FaPaintBrush, FaBolt, FaGamepad, FaSwimmer } from "react-icons/fa";

/**
 * Profile Component
 *
 * Displays user information and scores after login.
 *
 * @returns {JSX.Element} Profile page UI
 */
function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // Current logged-in user
    const [scores, setScores] = useState([]); // List of all scores fetched

    /**
     * useEffect
     *
     * Runs on component mount:
     * - Loads user from localStorage.
     * - If no user, redirects to login.
     * - Otherwise fetches scores from the server.
     */
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            toast.error("Please login first.");
            navigate("/login");
        } else {
            setUser(storedUser);
            fetchScores();
        }
    }, [navigate]);

    /**
     * fetchScores
     *
     * Fetches all user's scores from the server.
     */
    const fetchScores = async () => {
        try {
            const data = await scoreService.getScores();
            if (Array.isArray(data)) {
                setScores(data);
            } else {
                console.error("Fetched scores are not an array:", data);
                setScores([]); // fallback to empty array
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch scores");
        }
    };


    /**
     * getScoresByGame
     *
     * Filters scores by a given game type.
     *
     * @param {string} type - Game type (e.g., "BallGame", "SimonSays")
     * @returns {Array} List of scores for that game
     */
    const getScoresByGame = (type) => {
        if (!Array.isArray(scores)) return [];
        return scores.filter(score => score.gameType === type);
    };


    /**
     * getHighestScore
     *
     * Finds the highest score for a given game type.
     *
     * @param {string} type - Game type
     * @returns {number} Highest score or 0 if no scores
     */
    const getHighestScore = (type) => {
        const filtered = getScoresByGame(type);
        if (filtered.length === 0) return 0;
        return Math.max(...filtered.map(s => s.score));
    };

    /**
     * renderScores
     *
     * Renders a list of all scores for a given game.
     *
     * @param {string} type - Game type
     * @returns {JSX.Element} List of scores or no score message
     */
    const renderScores = (type) => {
        const gameScores = getScoresByGame(type);

        if (gameScores.length === 0) {
            return <p style={styles.noScore}>No scores yet.</p>;
        }

        return (
            <ul style={styles.scoreList}>
                {gameScores.map((s, idx) => (
                    <li
                        key={s._id}
                        style={{
                            ...styles.scoreItem,
                            backgroundColor: idx === 0 ? "#00c864" : "#fff",
                            color: idx === 0 ? "#fff" : "#333",
                            fontWeight: idx === 0 ? "bold" : "normal",
                        }}
                    >
                        {s.score} pts — {new Date(s.createdAt).toLocaleString()}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div style={styles.container}>
            {user && (
                <>
                    <h1 style={styles.title}>Welcome, {user.name} 👋</h1>

                    <div style={styles.cards}>

                        {/* Shape Tracing Section */}
                        <div style={styles.section}>
                            <h2>🎨 Shape Tracing</h2>
                            <h3>🏆 Highest Score: {getHighestScore("ShapeTracing")}</h3>
                            {renderScores("ShapeTracing")}
                            <button style={styles.buttonShape} onClick={() => navigate("/shape-tracing")}>
                                🎨 Play Shape Tracing
                            </button>
                        </div>

                        {/* Swipe Challenge Section */}
                        <div style={styles.section}>
                            <h2>🏓 Swipe Challenge</h2>
                            <h3>🏆 Highest Score: {getHighestScore("SwipeChallenge")}</h3>
                            {renderScores("SwipeChallenge")}
                            <button style={styles.buttonSwipe} onClick={() => navigate("/swipe-challenge")}>
                                🏓 Play Swipe Challenge
                            </button>
                        </div>

                        {/* Quick Reaction Section */}
                        <div style={styles.section}>
                            <h2>⚡ Quick Reaction</h2>
                            <h3>🏆 Highest Score: {getHighestScore("QuickReaction")}</h3>
                            {renderScores("QuickReaction")}
                            <button style={styles.buttonQuick} onClick={() => navigate("/quick-reaction")}>
                                ⚡ Play Quick Reaction
                            </button>
                        </div>

                        {/* Ball Game Section */}
                        <div style={styles.section}>
                            <h2>🏀 Ball Game</h2>
                            <h3>🏆 Highest Score: {getHighestScore("BallGame")}</h3>
                            {renderScores("BallGame")}
                            <button style={styles.button} onClick={() => navigate("/ball-game")}>
                                🎮 Play Ball Game
                            </button>
                        </div>

                        {/* Memory Match Section */}
                        <div style={styles.section}>
                            <h2>🧠 Memory Match</h2>
                            <h3>🏆 Highest Score: {getHighestScore("MemoryMatch")}</h3>
                            {renderScores("MemoryMatch")}
                            <button style={styles.buttonMemory} onClick={() => navigate("/memory-match")}>
                                🧠 Play Memory Match
                            </button>
                        </div>

                        {/* Simon Says Section */}
                        <div style={styles.section}>
                            <h2>✋ Simon Says</h2>
                            <h3>🏆 Highest Score: {getHighestScore("SimonSays")}</h3>
                            {renderScores("SimonSays")}
                            <button style={styles.buttonAlt} onClick={() => navigate("/simon-says")}>
                                ✋ Play Simon Says
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Inline styles for the Profile component
 */
const styles = {
    container: {
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    title: {
        fontSize: "2.5rem",
        marginBottom: "2rem",
        color: "#333",
    },
    cards: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem",
        width: "100%",
        maxWidth: "1200px",
    },
    section: {
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
    },
    scoreList: {
        listStyle: "none",
        padding: 0,
        marginTop: "1rem",
    },
    scoreItem: {
        padding: "10px",
        marginBottom: "8px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        textAlign: "center",
        fontSize: "16px",
    },
    noScore: {
        color: "#888",
        fontStyle: "italic",
        marginTop: "1rem",
    },
    button: {
        marginTop: "1.5rem",
        padding: "12px 24px",
        backgroundColor: "#0077ff",
        color: "#fff",
        fontSize: "18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    buttonAlt: {
        marginTop: "1.5rem",
        padding: "12px 24px",
        backgroundColor: "#ff9900",
        color: "#fff",
        fontSize: "18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    buttonShape: {
        marginTop: "1.5rem",
        padding: "12px 24px",
        backgroundColor: "#00c864",
        color: "#fff",
        fontSize: "18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    buttonMemory: {
        marginTop: "1.5rem",
        padding: "12px 24px",
        backgroundColor: "#6c5ce7",
        color: "#fff",
        fontSize: "18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    buttonSwipe: {
        marginTop: "1.5rem",
        padding: "12px 24px",
        backgroundColor: "#0984e3",
        color: "#fff",
        fontSize: "18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    buttonQuick: {
        marginTop: "1.5rem",
        padding: "12px 24px",
        backgroundColor: "#fdcb6e",
        color: "#333",
        fontSize: "18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },

};

export default Profile;
