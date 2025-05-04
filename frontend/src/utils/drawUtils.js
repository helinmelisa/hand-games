/**
 * Draw only the selected keypoints on the target hand.
 *
 * @param {Object} results
 *   - landmarks: Array of landmark arrays for each detected hand
 *   - handedness: Array of { categoryName: "Left"|"Right" } for each hand
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[]} selectedIndices  // e.g. [4,8,12,16,20]
 * @param {"Left"|"Right"|null} targetHand
 *   Which hand to draw; if null, draws for *all* hands
 * @param {Object} [options]
 *   - radius (default: 6)
 *   - fillStyle (default: "#5f1103")
 *   - strokeStyle (default: "white")
 */
export function drawSelectedKeypoints(landmarksPerHand, ctx, indices = [8], color = "#00ff00") {
    if (!landmarksPerHand?.length) return;
    const landmarks = landmarksPerHand[0];
    indices.forEach(i => {
        const kp = landmarks[i];
        if (!kp) return;
        ctx.beginPath();
        ctx.arc(
            kp.x * ctx.canvas.width,
            kp.y * ctx.canvas.height,
            6,  // radius
            0, // start angle
            2 * Math.PI // end angle
        );
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
    });
}