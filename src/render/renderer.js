import { WORLD_SIZE, GRID_STEP } from "../core/config.js";
import { drawBike, drawTrail, drawObstacles, drawBonuses } from "./draw.js";

export function renderWorld(world, ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!world.player) return;

    const camX = world.player.x;
    const camY = world.player.y;

    ctx.save();
    ctx.translate(w / 2, h / 2);

    ctx.fillStyle = "#020205";
    ctx.fillRect(-w, -h, w * 2, h * 2);

    ctx.strokeStyle = "#0d1a2a";
    ctx.lineWidth = 1;
    ctx.shadowColor = "#0a537d";
    ctx.shadowBlur = 3;

    for (let gx = -WORLD_SIZE/2; gx <= WORLD_SIZE/2; gx += GRID_STEP) {
        ctx.beginPath();
        ctx.moveTo(gx - camX, -WORLD_SIZE/2 - camY);
        ctx.lineTo(gx - camX, WORLD_SIZE/2 - camY);
        ctx.stroke();
    }

    for (let gy = -WORLD_SIZE/2; gy <= WORLD_SIZE/2; gy += GRID_STEP) {
        ctx.beginPath();
        ctx.moveTo(-WORLD_SIZE/2 - camX, gy - camY);
        ctx.lineTo(WORLD_SIZE/2 - camX, gy - camY);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;

    drawObstacles(world, ctx, camX, camY);

    for (const b of world.bikes) drawTrail(ctx, b, camX, camY);
    drawBonuses(world, ctx, camX, camY);
    for (const b of world.bikes) drawBike(ctx, b, camX, camY);

    ctx.restore();
}
