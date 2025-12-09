import { WORLD_SIZE, GRID_STEP } from './config.js';

function drawLightcycle(ctx, b, camX, camY) {
    const sx = b.x - camX;
    const sy = b.y - camY;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(b.angle);

    const WHEEL_R = 12;
    const CORE_R = WHEEL_R * 0.55;
    const BODY_W = 8;
    const BODY_L = 52;

    ctx.shadowColor = b.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = b.color;

    const frontX = BODY_L * 0.5;
    const backX = -BODY_L * 0.5;

    ctx.beginPath();
    ctx.arc(frontX, 0, WHEEL_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(backX, 0, WHEEL_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000000cc";

    ctx.beginPath();
    ctx.arc(frontX, 0, CORE_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(backX, 0, CORE_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 12;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(backX, -BODY_W / 2, BODY_L, BODY_W, 4);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffffbb";
    ctx.beginPath();
    ctx.moveTo(-10, -BODY_W * 0.45);
    ctx.lineTo(10, -BODY_W * 0.45);
    ctx.stroke();

    ctx.shadowBlur = 5;
    ctx.fillStyle = "#ffffffdd";
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

export function renderWorld(world, ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    if (!world.player) return;

    const camX = world.player.x;
    const camY = world.player.y;

    ctx.save();
    ctx.translate(w / 2, h / 2);

    ctx.fillStyle = '#020205';
    ctx.fillRect(-w, -h, w * 2, h * 2);

    ctx.strokeStyle = '#0d1a2a';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#0a537d';
    ctx.shadowBlur = 3;

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

    ctx.shadowBlur = 0;

    ctx.lineWidth = 5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#4499ff";
    ctx.strokeStyle = "#66ccff";

    for (const ob of world.obstacles) {
        ctx.save();
        if (ob.type === "wall") {
            ctx.beginPath();
            ctx.moveTo(ob.points[0].x - camX, ob.points[0].y - camY);
            ctx.lineTo(ob.points[1].x - camX, ob.points[1].y - camY);
            ctx.stroke();
        }
        else if (ob.type === "poly") {
            ctx.beginPath();
            for (let i = 0; i < ob.points.length; i++) {
                const p = ob.points[i];
                const nx = p.x - camX;
                const ny = p.y - camY;
                if (i === 0) ctx.moveTo(nx, ny);
                else ctx.lineTo(nx, ny);
            }
            ctx.closePath();
            ctx.stroke();
        }
        else if (ob.type === "shape_with_hole") {
            ctx.beginPath();
            const out = ob.outer;
            ctx.moveTo(out[0].x - camX, out[0].y - camY);
            for (let i = 1; i < out.length; i++)
                ctx.lineTo(out[i].x - camX, out[i].y - camY);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            const inn = ob.inner;
            ctx.moveTo(inn[0].x - camX, inn[0].y - camY);
            for (let i = 1; i < inn.length; i++)
                ctx.lineTo(inn[i].x - camX, inn[i].y - camY);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
    }

    ctx.strokeStyle = null;
    ctx.shadowBlur = 0;

    for (const b of world.bikes) {
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 22;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 6;

        const tr = b.trail;
        if (tr.length > 0) {
            ctx.beginPath();
            ctx.moveTo(tr[0].x - camX, tr[0].y - camY);
            for (let i = 1; i < tr.length; i++) {
                ctx.lineTo(tr[i].x - camX, tr[i].y - camY);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    for (const bonus of world.bonuses) {
        if (!bonus.alive) continue;
        const sx = bonus.x - camX;
        const sy = bonus.y - camY;

        ctx.save();
        ctx.shadowColor = '#ffff66';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#fff67f';
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    for (const b of world.bikes) {
        if (!b.alive) continue;
        drawLightcycle(ctx, b, camX, camY);
    }

    ctx.restore();
}
