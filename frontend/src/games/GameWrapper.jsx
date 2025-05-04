/**
 * A reusable game wrapper component that handles:
 * - Loading the hand landmark detection model
 * - Starting and managing the webcam video feed
 * - Controlling the game timer and game lifecycle
 * - Running the user's game-specific detect function
 * - Drawing hand keypoints on the canvas
 * - Saving the final game score
 *
 * Props:
 * - gameType {string}: The name/type of the game (used for display and saving scores).
 * - detectFunction {Function}: Game-specific detection and rendering logic provided by the child game.
 */

import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useNavigate } from "react-router-dom";

const GAME_DURATION = 60; // Game duration in seconds

/**
 * GameWrapper Component
 *
 * Provides a full-screen game layout with video and canvas.
 * Manages model loading, game timing, hand detection, and score saving.
 *
 * @param {Object} props
 * @param {string} props.gameType - Name/type of the game.
 * @param {Function} props.detectFunction - Function that handles game-specific detection and rendering logic.
 * @returns {JSX.Element} Fullscreen game interface
 */
function GameWrapper({ gameType, detectFunction }) {
    const videoRef = useRef(null); // Ref for the webcam video element
    const canvasRef = useRef(null); // Ref for the canvas element
    const navigate = useNavigate();

    const [handLandmarker, setHandLandmarker] = useState(null); // Hand detection model
    const [score, setScore] = useState(0); // Current score
    const [saved, setSaved] = useState(false); // Whether the score has been saved
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION); // Remaining time in seconds
    const [gameStarted, setGameStarted] = useState(false); // Whether the game has started
    const [gameOver, setGameOver] = useState(false); // Whether the game has ended

    /** Load the hand landmark model when component mounts */
    useEffect(() => {
        (async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            const model = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "/models/hand_landmarker.task",
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numHands: 2,
            });
            setHandLandmarker(model);
        })();
    }, []);

    /** Start the webcam stream */
    useEffect(() => {
        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        })();
    }, []);

    /** Handle countdown timer */
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameStarted, gameOver]);

    /** Save the score when the game is over */
    useEffect(() => {
        if (!handLandmarker || !gameStarted) return;
        let rafId;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const loop = async () => {
            if (!video || video.videoWidth === 0) {
                rafId = requestAnimationFrame(loop);
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!gameOver) {
                await detectFunction({
                    handLandmarker,
                    video,
                    canvas,
                    ctx,
                    setScore,
                });

                rafId = requestAnimationFrame(loop);
            }
        };

        rafId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(rafId);
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
    }, [handLandmarker, gameStarted, detectFunction, gameOver]);

    /** Handle the start button click */
    const handleStart = () => {
        setGameStarted(true);
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setGameOver(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.mirror}>
                <video ref={videoRef} autoPlay playsInline muted style={styles.media} />
                <canvas ref={canvasRef} style={styles.media} />
            </div>

            {/* Start Screen */}
            {!gameStarted && (
                <div style={styles.overlay}>
                    <h1>{gameType}</h1>
                    <button onClick={handleStart} style={styles.startButton}>Start Game</button>
                </div>
            )}

            {/* Score and Timer During Game */}
            {gameStarted && !gameOver && (
                <div style={styles.scoreOverlay}>
                    <p>⏱️ {timeLeft}s</p>
                    <p>🏆 {score} pts</p>
                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div style={styles.overlay}>
                    <h1>🎉 Game Over!</h1>
                    <h2>Final Score: {score}</h2>
                    <button onClick={() => navigate("/profile")} style={styles.startButton}>
                        Go to Profile
                    </button>
                </div>
            )}
        </div>
    );
}

/** Inline styles used in the GameWrapper */
const styles = {
    container: { position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#000" },
    mirror: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "scaleX(-1)" },
    media: { position: "absolute", width: "100%", height: "100%", objectFit: "cover" },
    overlay: { position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -30%)", color: "#fff", fontSize: "24px", textAlign: "center", zIndex: 10 },
    scoreOverlay: {
        position: "absolute",
        top: 20,
        left: 20,
        display: "flex",
        gap: "20px",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: "10px 20px",
        borderRadius: "10px",
        color: "#fff",
        fontSize: "18px",
        fontWeight: "bold",
        zIndex: 10,
    },
    startButton: { marginTop: "20px", padding: "12px 24px", fontSize: "20px", backgroundColor: "#00c864", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" },
};

export default GameWrapper;
