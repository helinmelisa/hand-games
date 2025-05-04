/**
 * A memory-reaction game where the player must tap balls in the shown order.
 * Each correct pattern increases the score and difficulty.
 */

import { drawSelectedKeypoints } from "../utils/drawUtils";
import GameWrapper from "./GameWrapper";
import { useRef } from "react";

const BALL_COUNT       = 4;
const FLASH_TIME       = 800;   // how long to light each ball (ms)
const WAIT_TIME        = 300;   // gap between lights (ms)
const BALL_RADIUS      = 30;
const FEEDBACK_TIME    = 500;   // how long to show green/red on tap

function BallGame() {
    // --- refs to drive our 3-phase state machine ---
    const ballsRef       = useRef([]);
    const sequenceRef    = useRef([]);
    const gameStateRef   = useRef("init");   // "init" | "show" | "input"
    const flashIndexRef  = useRef(0);
    const lastTimeRef    = useRef(0);
    const inputIndexRef  = useRef(0);

    // --- for debounce + per-tap feedback ---
    const tappedIdxRef     = useRef(null);
    const feedbackRef      = useRef(null);   // "correct" or "wrong" or null

    const detectFunction = async ({ handLandmarker, video, canvas, ctx, setScore }) => {
        const now = Date.now();
        const w   = canvas.width;
        const h   = canvas.height;

        // 1) -- INIT: place balls, start 1-step sequence, zero score
        if (gameStateRef.current === "init") {
            ballsRef.current = Array.from({ length: BALL_COUNT }, () => ({
                x: Math.random() * (w - BALL_RADIUS*2) + BALL_RADIUS,
                y: Math.random() * (h - BALL_RADIUS*2) + BALL_RADIUS,
            }));
            sequenceRef.current    = [Math.floor(Math.random() * BALL_COUNT)];
            flashIndexRef.current  = 0;
            lastTimeRef.current    = now;
            inputIndexRef.current  = 0;
            feedbackRef.current    = null;
            tappedIdxRef.current   = null;
            setScore(0);
            gameStateRef.current = "show";
        }

        // 2) -- SHOW: step through the sequence with FLASH + WAIT timing
        if (gameStateRef.current === "show") {
            const elapsed = now - lastTimeRef.current;
            if (elapsed > FLASH_TIME + WAIT_TIME) {
                lastTimeRef.current = now;
                flashIndexRef.current++;
                if (flashIndexRef.current >= sequenceRef.current.length) {
                    gameStateRef.current  = "input";
                    inputIndexRef.current = 0;
                    tappedIdxRef.current  = null;
                }
            }
        }

        // 3) -- DRAW all balls, choosing color based on phase + feedback
        ballsRef.current.forEach((ball, idx) => {
            const elapsed = now - lastTimeRef.current;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI*2);

            let fillColor;
            // a) still flashing the sequence?
            if (
                gameStateRef.current === "show" &&
                idx === sequenceRef.current[flashIndexRef.current] &&
                elapsed < FLASH_TIME
            ) {
                fillColor = "yellow";
            }
            // b) just tapped and in feedback window?
            else if (
                feedbackRef.current &&
                idx === tappedIdxRef.current
            ) {
                fillColor = feedbackRef.current === "correct" ? "green" : "red";
            }
            // c) user’s turn to tap
            else if (gameStateRef.current === "input") {
                fillColor = "rgba(100,150,255,0.8)";  // light blue
            }
            // d) idle (before show or between rounds)
            else {
                fillColor = "rgba(100,100,100,0.5)";  // grey‐green
            }

            ctx.fillStyle   = fillColor;
            ctx.fill();
            ctx.strokeStyle = "#242725";
            ctx.lineWidth   = 2;
            ctx.stroke();
        });

        // 4) -- INPUT: detect fingertip taps only when it’s input phase
        if (gameStateRef.current === "input") {
            const results = await handLandmarker.detectForVideo(video, now);
            if (results?.landmarks?.length) {
                drawSelectedKeypoints(results.landmarks, ctx, [8], "#ff9f00");
                const tip = results.landmarks[0][8];
                const tipX = tip.x * w;
                const tipY = tip.y * h;
                let touching = false;

                ballsRef.current.forEach((ball, idx) => {
                    const d = Math.hypot(ball.x - tipX, ball.y - tipY);
                    if (d < BALL_RADIUS) {
                        touching = true;
                        if (!tappedIdxRef.current) {
                            tappedIdxRef.current = idx;
                            const correctIdx = sequenceRef.current[inputIndexRef.current];
                            const isCorrect = idx === correctIdx;
                            feedbackRef.current = isCorrect ? "correct" : "wrong";

                            setTimeout(() => {
                                if (feedbackRef.current === "wrong") {
                                    gameStateRef.current = "init";
                                } else {
                                    inputIndexRef.current++;
                                    if (inputIndexRef.current === sequenceRef.current.length) {
                                        setScore(prev => prev + 1);
                                        sequenceRef.current.push(Math.floor(Math.random() * BALL_COUNT));
                                        flashIndexRef.current = 0;
                                        lastTimeRef.current = Date.now();
                                        gameStateRef.current = "show";
                                    }
                                }
                                feedbackRef.current = null;
                                tappedIdxRef.current = null;
                            }, FEEDBACK_TIME);
                        }
                    }
                });
                // lift debounce when finger leaves all balls
                if (!touching && !feedbackRef.current) {
                    tappedIdxRef.current = null;
                }
            }
        }
    };

    return (
        <GameWrapper
            gameType="BallGame"
            detectFunction={detectFunction}
        />
    );
}

export default BallGame;