/**
 * A reaction-based game where the player must swipe in the correct direction.
 * Directions: Left, Right, Up, Down.
 */

import { drawSelectedKeypoints } from "../utils/drawUtils";
import GameWrapper from "./GameWrapper";
import { useRef, useState } from "react";

const ROUND_TIME = 5; // Seconds to complete each swipe
const DIRECTIONS = ["left", "right", "up", "down"];

function SwipeChallenge() {
    // --- refs to manage swipe detection state ---
    const currentDirectionRef = useRef(null); // Target swipe direction
    const swipeStartRef = useRef(null);        // Starting position of swipe
    const roundTimerRef = useRef(Date.now());  // Start time of current round

    // --- state to track countdown timer ---
    const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_TIME);

    /**
     * Main per-frame loop:
     * - Chooses new swipe direction if needed.
     * - Tracks fingertip movement.
     * - Detects swipe direction and compares with target.
     * - Awards score on correct swipe.
     */
    const detectFunction = async ({ handLandmarker, video, canvas, ctx, setScore }) => {
        const now = Date.now();
        const width = canvas.width;
        const height = canvas.height;

        // 1) -- Start New Round if Time Expired
        if (!currentDirectionRef.current || now - roundTimerRef.current > ROUND_TIME * 1000) {
            currentDirectionRef.current = randomDirection();
            roundTimerRef.current = now;
            swipeStartRef.current = null; // Reset swipe
        }

        // 2) -- Update Countdown Timer
        setRoundTimeLeft(Math.max(0, ROUND_TIME - Math.floor((now - roundTimerRef.current) / 1000)));

        // 3) -- Detect Hand and Swipe
        const results = await handLandmarker.detectForVideo(video, now);

        if (results?.landmarks?.length) {
            const landmarks = results.landmarks[0];
            const tip = landmarks[8]; // Index finger tip
            drawSelectedKeypoints(results.landmarks, ctx, [8], "#ff9f00");

            const tipX = tip.x * width;
            const tipY = tip.y * height;

            if (!swipeStartRef.current) {
                // Record starting point
                swipeStartRef.current = { x: tipX, y: tipY, time: now };
            } else {
                // Measure swipe movement
                const deltaX = tipX - swipeStartRef.current.x;
                const deltaY = tipY - swipeStartRef.current.y;
                const distance = Math.hypot(deltaX, deltaY);

                if (distance > 80) {
                    const detectedDirection = getSwipeDirection(deltaX, deltaY);

                    // Check if swipe matches prompt
                    if (detectedDirection === currentDirectionRef.current) {
                        setScore(prev => prev + 1);
                    }

                    // Reset for next round
                    currentDirectionRef.current = null;
                    swipeStartRef.current = null;
                    roundTimerRef.current = now;
                }
            }
        }

        // 4) -- Draw Current Prompt Text
        drawTexts(ctx, width, height, currentDirectionRef.current, roundTimeLeft);
    };

    /**
     * Picks a random swipe direction.
     */
    const randomDirection = () => {
        return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    };

    /**
     * Detects swipe direction based on movement deltas.
     */
    const getSwipeDirection = (deltaX, deltaY) => {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? "right" : "left";
        } else {
            return deltaY > 0 ? "down" : "up";
        }
    };

    /**
     * Draws the swipe instruction and countdown timer on screen.
     */
    const drawTexts = (ctx, width, height, direction, timeLeft) => {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-width, 0);

        ctx.font = "32px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        const text = direction ? `Swipe ${arrowText(direction)}` : "Get Ready...";
        ctx.fillText(text, width / 2, height / 2 - 20);

        ctx.font = "24px Arial";
        ctx.fillText(`Time Left: ${timeLeft}s`, width / 2, height / 2 + 30);

        ctx.restore();
    };

    /**
     * Converts direction to arrow emoji for display.
     */
    const arrowText = (direction) => {
        if (direction === "left") return "⬅️";
        if (direction === "right") return "➡️";
        if (direction === "up") return "⬆️";
        if (direction === "down") return "⬇️";
        return "";
    };

    return (
        <GameWrapper
            gameType="SwipeChallenge"
            detectFunction={detectFunction}
        />
    );
}

export default SwipeChallenge;
