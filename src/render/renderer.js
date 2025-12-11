import { WORLD_SIZE, GRID_STEP } from "../core/config.js";
import { drawBike, drawTrail, drawObstacles, drawBonuses, drawExplosions } from "./draw.js";

export function renderWorld(world, ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    if (!world.player) return;

    // -----------------------------
    // CAMERA LOGIC
    // -----------------------------

    let camX, camY, scale = 1;

    if (world.mode === "duel") {
        // 🔥 Режим 1 на 1 — показати всю карту
        camX = 0;
        camY = 0;

        // Визначаємо масштаб, щоб WORLD_SIZE повністю вмістився
        const scaleX = w / WORLD_SIZE;
        const scaleY = h / WORLD_SIZE;
        scale = Math.min(scaleX, scaleY) * 0.95;  // невелике поле навколо
    } 
    else {
        // 🔥 Нормальний режим — слідуємо за гравцем
        camX = world.player.x;
        camY = world.player.y;
        scale = 1;
    }

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);

    // Фон
    ctx.fillStyle = "#020205";
    ctx.fillRect(-w, -h, w * 2, h * 2);

    // GRID
    ctx.strokeStyle = "#0d1a2a";
    ctx.lineWidth = 1 / scale;
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

    for (const b of world.bikes)
        drawTrail(ctx, b, camX, camY);

    drawBonuses(world, ctx, camX, camY);

    drawExplosions(world, ctx, camX, camY);

    for (const b of world.bikes)
        drawBike(ctx, b, camX, camY);

    ctx.restore();
}
