/**
 * This component implements a shape tracing game where users are asked to trace
 * either a circle or a square shape using their finger.
 * Users must pass through dynamically generated checkpoints on the shape to score.
 *
 * Main Features:
 * - Randomly select a circle or a square at the start.
 * - Spawn checkpoints dynamically along the selected shape.
 * - Start trail drawing only when the user touches the shape.
 * - Draw trails following the fingertip movement.
 * - Track checkpoint hits and award score after sufficient hits.
 *
 * Uses GameWrapper for the main game loop and detection handling.
 */

import { drawSelectedKeypoints } from "../utils/drawUtils";
import GameWrapper from "./GameWrapper";
import { useRef, useState } from "react";

const SHAPE_TYPES = ["circle", "square"]; // Available shape types
const TOLERANCE = 25; // Margin of error in pixels for hitting checkpoints
const CHECKPOINTS = 16; // Number of checkpoints per shape

/**
 * ShapeTracing Component
 *
 * Provides a dynamic shape tracing game experience.
 *
 * @returns {JSX.Element} Shape tracing game screen
 */
function ShapeTracing() {
    const shapeTypeRef = useRef(null); // Current active shape type ("circle" or "square")
    const checkpointsHitRef = useRef(new Set()); // Set to track which checkpoints have been hit
    const trailPointsRef = useRef([]); // Points for the trail drawing
    const drawingStartedRef = useRef(false); // Whether trail drawing has started
    const [currentShape, setCurrentShape] = useState(null); // React state for displaying current shape

    /**
     * detectFunction
     *
     * Main game loop:
     * - Draws the current shape.
     * - Detects the user's finger movement.
     * - Draws trail if finger is on the shape.
     * - Tracks checkpoints hit by finger.
     * - Awards score when 90% of checkpoints are hit.
     *
     * @param {Object} params
     * @param {Object} params.handLandmarker - Hand detection model
     * @param {HTMLVideoElement} params.video - Webcam feed
     * @param {HTMLCanvasElement} params.canvas - Canvas for drawing
     * @param {CanvasRenderingContext2D} params.ctx - Canvas context
     * @param {Function} params.setScore - Score update function
     */
    const detectFunction = async ({ handLandmarker, video, canvas, ctx, setScore }) => {
        const now = Date.now();

        const width = canvas.width;
        const height = canvas.height;
        const shortSide = Math.min(width, height);

        const dynamicRadius = shortSide * 0.3;
        const dynamicSize = shortSide * 0.6;
        const centerX = width / 2;
        const centerY = height / 2;

        // Randomly choose a shape if none is selected yet
        if (!shapeTypeRef.current) {
            const randomShape = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
            shapeTypeRef.current = randomShape;
            setCurrentShape(randomShape);
            checkpointsHitRef.current.clear();
            trailPointsRef.current = [];
            drawingStartedRef.current = false;
        }

        // Draw the current shape
        if (shapeTypeRef.current === "circle") {
            drawCircle(ctx, centerX, centerY, dynamicRadius);
        } else if (shapeTypeRef.current === "square") {
            drawSquare(ctx, centerX - dynamicSize/2, centerY - dynamicSize/2, dynamicSize, dynamicSize);
        }

        const results = await handLandmarker.detectForVideo(video, now);

        if (results?.landmarks?.length) {
            const landmarks = results.landmarks[0];
            const tip = landmarks[8];
            drawSelectedKeypoints(results.landmarks, ctx, [8], "#ff9f00");

            const tipX = tip.x * width;
            const tipY = tip.y * height;

            // Start drawing only if finger touches the shape
            if (!drawingStartedRef.current) {
                if (isOnShape(centerX, centerY, dynamicRadius, dynamicSize, tipX, tipY)) {
                    drawingStartedRef.current = true;
                }
            }

            // Record trail points after start
            if (drawingStartedRef.current) {
                trailPointsRef.current.push({ x: tipX, y: tipY, timestamp: now });
                drawTrail(ctx);
            }

            // Check if a checkpoint has been hit
            if (shapeTypeRef.current === "circle") {
                checkCircleHit(centerX, centerY, dynamicRadius, tipX, tipY);
            } else if (shapeTypeRef.current === "square") {
                checkSquareHit(centerX, centerY, dynamicSize, tipX, tipY);
            }
        }

        // If 90% or more checkpoints hit, score and reset
        if (checkpointsHitRef.current.size >= Math.floor(CHECKPOINTS * 0.9)) {
            setScore(prev => prev + 1);
            shapeTypeRef.current = null;
            checkpointsHitRef.current.clear();
            trailPointsRef.current = [];
            drawingStartedRef.current = false;
        }
    };

    /**
     * Check if fingertip is on the current shape (circle or square)
     */
    const isOnShape = (centerX, centerY, radius, size, tipX, tipY) => {
        if (shapeTypeRef.current === "circle") {
            const dist = Math.hypot(tipX - centerX, tipY - centerY);
            return Math.abs(dist - radius) < TOLERANCE;
        } else if (shapeTypeRef.current === "square") {
            const left = centerX - size / 2;
            const right = centerX + size / 2;
            const top = centerY - size / 2;
            const bottom = centerY + size / 2;

            const insideSquare =
                tipX >= left - TOLERANCE &&
                tipX <= right + TOLERANCE &&
                tipY >= top - TOLERANCE &&
                tipY <= bottom + TOLERANCE;

            const nearEdge =
                Math.abs(tipX - left) < TOLERANCE ||
                Math.abs(tipX - right) < TOLERANCE ||
                Math.abs(tipY - top) < TOLERANCE ||
                Math.abs(tipY - bottom) < TOLERANCE;

            return insideSquare && nearEdge;
        }
        return false;
    };

    /**
     * Check if any circle checkpoints are hit
     */
    const checkCircleHit = (centerX, centerY, radius, tipX, tipY) => {
        for (let i = 0; i < CHECKPOINTS; i++) {
            const angle = (i / CHECKPOINTS) * Math.PI * 2;
            const checkpointX = centerX + radius * Math.cos(angle);
            const checkpointY = centerY + radius * Math.sin(angle);

            const dist = Math.hypot(checkpointX - tipX, checkpointY - tipY);
            if (dist < TOLERANCE) {
                checkpointsHitRef.current.add(i);
            }
        }
    };

    /**
     * Check if any square checkpoints are hit
     */
    const checkSquareHit = (centerX, centerY, size, tipX, tipY) => {
        const left = centerX - size / 2;
        const right = centerX + size / 2;
        const top = centerY - size / 2;
        const bottom = centerY + size / 2;

        const sides = [
            { x: left, y: top + (size / (CHECKPOINTS/4)) * 0 },
            { x: left, y: top + (size / (CHECKPOINTS/4)) * 1 },
            { x: left, y: top + (size / (CHECKPOINTS/4)) * 2 },
            { x: left, y: top + (size / (CHECKPOINTS/4)) * 3 },
            { x: left + (size / (CHECKPOINTS/4)) * 0, y: top },
            { x: left + (size / (CHECKPOINTS/4)) * 1, y: top },
            { x: left + (size / (CHECKPOINTS/4)) * 2, y: top },
            { x: left + (size / (CHECKPOINTS/4)) * 3, y: top },
            { x: right, y: top + (size / (CHECKPOINTS/4)) * 0 },
            { x: right, y: top + (size / (CHECKPOINTS/4)) * 1 },
            { x: right, y: top + (size / (CHECKPOINTS/4)) * 2 },
            { x: right, y: top + (size / (CHECKPOINTS/4)) * 3 },
        ];

        sides.forEach((edge, idx) => {
            const dist = Math.hypot(edge.x - tipX, edge.y - tipY);
            if (dist < TOLERANCE) {
                checkpointsHitRef.current.add(idx);
            }
        });
    };

    /**
     * Draw the user's trail following their finger
     */
    const drawTrail = (ctx) => {
        ctx.beginPath();
        for (let i = 0; i < trailPointsRef.current.length - 1; i++) {
            const p1 = trailPointsRef.current[i];
            const p2 = trailPointsRef.current[i + 1];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
        ctx.strokeStyle = "rgba(0,255,255,0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    /**
     * Draw a circle outline
     */
    const drawCircle = (ctx, x, y, radius) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#00c8ff";
        ctx.lineWidth = 5;
        ctx.stroke();
    };

    /**
     * Draw a square outline
     */
    const drawSquare = (ctx, x, y, width, height) => {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.strokeStyle = "#ff9f00";
        ctx.lineWidth = 5;
        ctx.stroke();
    };

    return (
        <GameWrapper
            gameType="ShapeTracing"
            detectFunction={detectFunction}
        />
    );
}

export default ShapeTracing;
