/**
 * This component implements a "Simon Says" style game where players have to
 * match a random hand gesture shown on screen before the timer runs out.
 *
 * Main Features:
 * - Randomly select a gesture every 5 seconds.
 * - Detect the player's hand gesture using landmarks.
 * - Compare detected gesture against the expected one.
 * - Award points for correct gestures.
 * - Display timer countdown and gesture name.
 *
 * Uses GameWrapper to handle camera, hand detection, and game timing.
 */

import GameWrapper from "./GameWrapper";
import { useRef, useCallback } from "react";

const ROUND_TIME = 5;
const GESTURES = ["open", "two", "rock", "thumbs_up", "fist"];

// Mapping for display text
const gestureTextMap = {
    open:     "🖐️ Open Hand",
    two:      "✌️ Two Fingers",
    rock:     "🤘 Rock Sign",
    thumbs_up:"👍 Thumbs Up",
    fist:     "👊 Fist",
};

// Helper: get display label
const gestureText = (g) => gestureTextMap[g] || "";

// Draws the instruction and timer on the canvas
function drawTexts(ctx, w, h, gesture, timeLeft) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-w, 0);
    ctx.font = "32px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(
        `Simon Says: ${gestureText(gesture) || "Waiting..."}`,
        w / 2,
        h / 2 - 40
    );
    ctx.font = "24px Arial";
    ctx.fillText(`Time Left: ${timeLeft.toFixed(1)}s`, w / 2, h / 2 + 10);
    ctx.restore();
}

// Detects whether the landmarks match the target gesture
function checkGesture(landmarks, gesture) {
    // Compute palm center from key palm points
    const palmIndices = [0, 1, 5, 9, 13, 17];
    const palm = palmIndices.reduce(
        (acc, i) => ({ x: acc.x + landmarks[i].x, y: acc.y + landmarks[i].y }),
        { x: 0, y: 0 }
    );
    palm.x /= palmIndices.length;
    palm.y /= palmIndices.length;

    // Dynamic threshold based on palm-to-middle-Finger-MCP distance
    const mcpY = landmarks[9].y;
    const driveDist = Math.abs(mcpY - palm.y);
    const upThresh   = palm.y - driveDist * 0.5;
    const downThresh = palm.y + driveDist * 0.3;

    const isUp   = (pt) => pt.y < upThresh;
    const isDown = (pt) => pt.y > downThresh;

    const [thumbTip, thumbIp, indexTip, middleTip, ringTip, pinkyTip] =
        [landmarks[4], landmarks[3], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];

    const rules = {
        open:      isUp(indexTip) && isUp(middleTip) && isUp(ringTip) && isUp(pinkyTip) && Math.abs(thumbTip.x - palm.x) > driveDist * 0.3,
        two:       isUp(indexTip) && isUp(middleTip) && isDown(ringTip) && isDown(pinkyTip),
        rock:      isUp(indexTip) && isDown(middleTip) && isDown(ringTip) && isUp(pinkyTip),
        thumbs_up: isUp(thumbTip) && isDown(indexTip) && isDown(middleTip) && isDown(ringTip) && isDown(pinkyTip),
        fist:      isDown(indexTip) && isDown(middleTip) && isDown(ringTip) && isDown(pinkyTip) && isDown(thumbTip),
    };

    return rules[gesture] || false;
}

// Main component
export default function SimonSays() {
    const gestureRef = useRef(null);
    const timerRef   = useRef(Date.now());

    const detectFunction = useCallback(
        async ({ handLandmarker, video, canvas, ctx, setScore }) => {
            const now = Date.now();
            const w   = canvas.width;
            const h   = canvas.height;

            // Start a new round if needed
            if (!gestureRef.current || now - timerRef.current > ROUND_TIME * 1000) {
                gestureRef.current = GESTURES[Math.floor(Math.random() * GESTURES.length)];
                timerRef.current   = now;
            }

            // Compute remaining time
            const timeLeft = Math.max(0, ROUND_TIME - (now - timerRef.current) / 1000);

            // Detect hand landmarks
            const results = await handLandmarker.detectForVideo(video, now);
            if (results?.landmarks?.length) {
                const lm = results.landmarks[0];
                if (timeLeft > 0 && checkGesture(lm, gestureRef.current)) {
                    setScore((s) => s + 1);
                    // Immediately start next round
                    gestureRef.current = null;
                    timerRef.current   = now;
                }
            }

            // Draw UI
            drawTexts(ctx, w, h, gestureRef.current, timeLeft);
        },
        []
    );

    return <GameWrapper gameType="SimonSays" detectFunction={detectFunction} />;
}
