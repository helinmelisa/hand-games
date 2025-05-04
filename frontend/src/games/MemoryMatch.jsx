/**
 * A memory-reaction game where the player must replicate a sequence of hand gestures.
 * Each correct gesture progresses the sequence. Completing the full sequence scores a point.
 *
 * Main Phases:
 * - Show a sequence of gestures (one at a time)
 * - Player must replicate gestures in order
 * - Successful sequence → score +1 → harder next round
 */

import { drawSelectedKeypoints } from "../utils/drawUtils";
import GameWrapper from "./GameWrapper";
import { useRef, useState } from "react";

const ROUND_TIME = 8; // seconds to complete a sequence
const GESTURES = ["open", "two", "rock", "thumbs_up", "fist"];

function MemoryMatch() {
    // --- refs to manage current round state ---
    const currentSequenceRef = useRef([]);  // Current target sequence
    const currentStepRef = useRef(0);        // Current step index in sequence
    const roundTimerRef = useRef(Date.now()); // Time when round started

    // --- local state to show countdown timer ---
    const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_TIME);

    /**
     * Main per-frame loop:
     * - Handles starting new sequences
     * - Updates round countdown
     * - Detects gestures via HandLandmarker
     * - Progresses user through sequence
     */
    const detectFunction = async ({ handLandmarker, video, canvas, ctx, setScore }) => {
        const now = Date.now();
        const width = canvas.width;
        const height = canvas.height;

        // 1) -- INIT: Start a new sequence if needed
        if (currentSequenceRef.current.length === 0 || now - roundTimerRef.current > ROUND_TIME * 1000) {
            const newSequence = [randomGesture(), randomGesture()];
            currentSequenceRef.current = newSequence;
            currentStepRef.current = 0;
            roundTimerRef.current = now;
        }

        // 2) -- Update Countdown Timer
        setRoundTimeLeft(Math.max(0, ROUND_TIME - Math.floor((now - roundTimerRef.current) / 1000)));

        // 3) -- Detect Hand and Draw Landmarks
        const results = await handLandmarker.detectForVideo(video, now);
        if (results?.landmarks?.length) {
            drawSelectedKeypoints(results.landmarks, ctx, [4,8,12,16,20], "#ff9f00");

            const landmarks = results.landmarks[0];
            const currentTarget = currentSequenceRef.current[currentStepRef.current];

            // 4) -- Check if Correct Gesture
            if (checkGesture(landmarks, currentTarget)) {
                currentStepRef.current += 1;

                if (currentStepRef.current >= currentSequenceRef.current.length) {
                    // Completed the sequence successfully
                    setScore(prev => prev + 1);
                    currentSequenceRef.current = []; // start new round
                    currentStepRef.current = 0;
                }
            }
        }

        // 5) -- Draw Instructions Text
        drawTexts(ctx, width, height, currentSequenceRef.current, currentStepRef.current, roundTimeLeft);
    };

    /**
     * Picks a random gesture from the GESTURES array.
     */
    const randomGesture = () => {
        return GESTURES[Math.floor(Math.random() * GESTURES.length)];
    };

    /**
     * Draws the current gesture instruction and timer on canvas.
     */
    const drawTexts = (ctx, width, height, sequence, step, timeLeft) => {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-width, 0);

        ctx.font = "28px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        const text = sequence.length > 0
            ? `Memory Match: ${gestureText(sequence[step])}`
            : "Get Ready...";

        ctx.fillText(text, width / 2, height / 2 - 40);

        ctx.font = "20px Arial";
        ctx.fillText(`Step ${step + 1} / ${sequence.length}`, width / 2, height / 2);
        ctx.fillText(`Time Left: ${timeLeft}s`, width / 2, height / 2 + 40);

        ctx.restore();
    };

    /**
     * Compares detected hand landmarks against target gesture.
     */
    const checkGesture = (landmarks, gesture) => {
        const palmBase = landmarks[0];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];

        const handCenterY = palmBase.y;

        const isFingerUp = (tip) => tip.y < handCenterY - 0.05;
        const isFingerDown = (tip) => tip.y > handCenterY + 0.05;

        const isOpen =
            isFingerUp(indexTip) &&
            isFingerUp(middleTip) &&
            isFingerUp(ringTip) &&
            isFingerUp(pinkyTip) &&
            thumbTip.x < palmBase.x;

        const isTwo =
            isFingerUp(indexTip) &&
            isFingerUp(middleTip) &&
            isFingerDown(ringTip) &&
            isFingerDown(pinkyTip);

        const isRock =
            isFingerUp(indexTip) &&
            isFingerDown(middleTip) &&
            isFingerDown(ringTip) &&
            isFingerUp(pinkyTip);

        const isThumbsUp =
            Math.abs(thumbTip.y - thumbIp.y) > 0.04 &&
            isFingerDown(indexTip) &&
            isFingerDown(middleTip) &&
            isFingerDown(ringTip) &&
            isFingerDown(pinkyTip);

        const isFist =
            isFingerDown(indexTip) &&
            isFingerDown(middleTip) &&
            isFingerDown(ringTip) &&
            isFingerDown(pinkyTip) &&
            Math.abs(thumbTip.y - palmBase.y) < 0.1;

        if (gesture === "open") return isOpen;
        if (gesture === "two") return isTwo;
        if (gesture === "rock") return isRock;
        if (gesture === "thumbs_up") return isThumbsUp;
        if (gesture === "fist") return isFist;
        return false;
    };

    /**
     * Converts gesture keyword to friendly label.
     */
    const gestureText = (gesture) => {
        if (gesture === "open") return "🖐️ Open Hand";
        if (gesture === "two") return "✌️ Two Fingers";
        if (gesture === "rock") return "🤘 Rock Sign";
        if (gesture === "thumbs_up") return "👍 Thumbs Up";
        if (gesture === "fist") return "👊 Fist";
        return "";
    };

    return (
        <GameWrapper
            gameType="MemoryMatch"
            detectFunction={detectFunction}
        />
    );
}

export default MemoryMatch;
