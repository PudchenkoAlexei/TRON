import { WORLD_SIZE, GRID_STEP } from './config.js';

export function renderWorld(world, ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!world.player) return;

    const camX = world.player.x;
    const camY = world.player.y;

    ctx.save();
    ctx.translate(w / 2, h / 2);

    ctx.strokeStyle = '#101010';
    ctx.lineWidth = 1;

    for (let gx = -WORLD_SIZE / 2; gx <= WORLD_SIZE / 2; gx += GRID_STEP) {
        ctx.beginPath();
        ctx.moveTo(gx - camX, -WORLD_SIZE / 2 - camY);
        ctx.lineTo(gx - camX, WORLD_SIZE / 2 - camY);
        ctx.stroke();
    }

    for (let gy = -WORLD_SIZE / 2; gy <= WORLD_SIZE / 2; gy += GRID_STEP) {
        ctx.beginPath();
        ctx.moveTo(-WORLD_SIZE / 2 - camX, gy - camY);
        ctx.lineTo(WORLD_SIZE / 2 - camX, gy - camY);
        ctx.stroke();
    }

    for (const b of world.bikes) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        if (b.trail.length > 0) {
            ctx.beginPath();
            for (let i = 0; i < b.trail.length; i++) {
                const p = b.trail[i];
                const sx = p.x - camX;
                const sy = p.y - camY;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
        }
    }

    for (const bonus of world.bonuses) {
        if (!bonus.alive) continue;
        const sx = bonus.x - camX;
        const sy = bonus.y - camY;
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
    }

    for (const b of world.bikes) {
        if (!b.alive) continue;

        const sx = b.x - camX;
        const sy = b.y - camY;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(b.angle);

        ctx.fillStyle = b.color;
        ctx.fillRect(-6, -4, 12, 8);

        ctx.restore();
    }

    ctx.restore();
}
