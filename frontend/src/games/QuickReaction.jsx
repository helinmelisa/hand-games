/**
 * A reaction-speed game where the player must quickly tap appearing targets.
 */

import { drawSelectedKeypoints } from "../utils/drawUtils";
import GameWrapper from "./GameWrapper";
import { useRef, useState } from "react";

const SPAWN_INTERVAL = 2000; // New target every 2 seconds
const TARGET_RADIUS = 30;    // Target size in pixels

function QuickReaction() {
    // --- refs to manage target spawning and timing ---
    const targetRef = useRef(null);         // Current active target
    const lastSpawnRef = useRef(Date.now()); // Last time a target was spawned

    // --- state to track reaction time for display ---
    const [reactionTime, setReactionTime] = useState(null);

    /**
     * Main per-frame loop:
     * - Spawns a new target periodically
     * - Draws the current target
     * - Detects fingertip tap and checks collision
     * - Updates score and reaction time
     */
    const detectFunction = async ({ handLandmarker, video, canvas, ctx, setScore }) => {
        const now = Date.now();
        const width = canvas.width;
        const height = canvas.height;

        // 1) -- Spawn New Target if Needed
        if (!targetRef.current || now - lastSpawnRef.current > SPAWN_INTERVAL) {
            targetRef.current = {
                x: Math.random() * (width - 2 * TARGET_RADIUS) + TARGET_RADIUS,
                y: Math.random() * (height - 2 * TARGET_RADIUS) + TARGET_RADIUS,
                spawnTime: now,
            };
            lastSpawnRef.current = now;
        }

        // 2) -- Draw Target
        if (targetRef.current) {
            ctx.beginPath();
            ctx.arc(targetRef.current.x, targetRef.current.y, TARGET_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 0, 0, 0.7)"; // Red transparent circle
            ctx.fill();
        }

        // 3) -- Detect Fingertip and Check Tap
        const results = await handLandmarker.detectForVideo(video, now);
        if (results?.landmarks?.length) {
            drawSelectedKeypoints(results.landmarks, ctx, [8], "#ff9f00"); // Draw fingertip

            const tipX = results.landmarks[0][8].x * width;
            const tipY = results.landmarks[0][8].y * height;

            const dx = tipX - targetRef.current.x;
            const dy = tipY - targetRef.current.y;
            const dist = Math.hypot(dx, dy);

            if (dist < TARGET_RADIUS) {
                // Successful tap!
                const reactMs = now - targetRef.current.spawnTime;
                setReactionTime(reactMs);

                setScore(prev => prev + 1);

                targetRef.current = null; // Clear and respawn new target
                lastSpawnRef.current = now;
            }
        }

        // 4) -- Draw Reaction Time Text
        drawTexts(ctx, width, height, reactionTime);
    };

    /**
     * Displays the last measured reaction time at top center of screen.
     */
    const drawTexts = (ctx, width, height, reactionTime) => {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-width, 0);

        ctx.font = "24px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        if (reactionTime !== null) {
            ctx.fillText(`Last Reaction: ${reactionTime} ms`, width / 2, 40);
        }

        ctx.restore();
    };

    return (
        <GameWrapper
            gameType="QuickReaction"
            detectFunction={detectFunction}
        />
    );
}

export default QuickReaction;
