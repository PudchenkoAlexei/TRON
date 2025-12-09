function drawLightcycle(ctx, b, camX, camY) {
    if (!b.alive) return;

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

    ctx.restore();
}

export function drawBike(ctx, bike, camX, camY) {
    if (!bike.alive) return;
    drawLightcycle(ctx, bike, camX, camY);
}

export function drawTrail(ctx, b, camX, camY) {
    if (!b.trail.length) return;

    ctx.save();
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 22;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 6;

    const tr = b.trail;

    ctx.beginPath();
    ctx.moveTo(tr[0].x - camX, tr[0].y - camY);
    for (let i = 1; i < tr.length; i++) {
        ctx.lineTo(tr[i].x - camX, tr[i].y - camY);
    }
    ctx.stroke();

    ctx.restore();
}

export function drawObstacles(world, ctx, camX, camY) {
    ctx.strokeStyle = "#66ccff";
    ctx.lineWidth = 5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#4499ff";

    for (const ob of world.obstacles) {
        if (ob.type === "wall") {
            const a = ob.points[0];
            const b = ob.points[1];
            ctx.beginPath();
            ctx.moveTo(a.x - camX, a.y - camY);
            ctx.lineTo(b.x - camX, b.y - camY);
            ctx.stroke();
        } 
        else if (ob.type === "poly") {
            ctx.beginPath();
            for (let i = 0; i < ob.points.length; i++) {
                const p = ob.points[i];
                if (i === 0) ctx.moveTo(p.x - camX, p.y - camY);
                else ctx.lineTo(p.x - camX, p.y - camY);
            }
            ctx.closePath();
            ctx.stroke();
        } 
        else if (ob.type === "shape_with_hole") {
            const out = ob.outer;
            ctx.beginPath();
            ctx.moveTo(out[0].x - camX, out[0].y - camY);
            for (let i = 1; i < out.length; i++)
                ctx.lineTo(out[i].x - camX, out[i].y - camY);
            ctx.closePath();
            ctx.stroke();

            const inn = ob.inner;
            ctx.beginPath();
            ctx.moveTo(inn[0].x - camX, inn[0].y - camY);
            for (let i = 1; i < inn.length; i++)
                ctx.lineTo(inn[i].x - camX, inn[i].y - camY);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

export function drawBonuses(world, ctx, camX, camY) {
    ctx.save();

    for (const bonus of world.bonuses) {
        if (!bonus.alive) continue;

        const x = bonus.x - camX;
        const y = bonus.y - camY;

        if (bonus.type === "speed") {
            ctx.save();
            ctx.translate(x, y);
            ctx.shadowColor = "#ff9900";
            ctx.shadowBlur = 20;
            ctx.fillStyle = "#ffcc55";

            ctx.beginPath();
            ctx.moveTo(-6, -10);
            ctx.lineTo(4, -2);
            ctx.lineTo(-2, -2);
            ctx.lineTo(6, 10);
            ctx.lineTo(-4, 2);
            ctx.lineTo(2, 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        else if (bonus.type === "long_trail") {
            ctx.save();
            ctx.translate(x, y);
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#33ff66";
            ctx.fillStyle = "#66ff99";

            ctx.beginPath();
            ctx.roundRect(-4, -14, 8, 28, 3);
            ctx.fill();

            ctx.restore();
        }
    }

    ctx.restore();
}

export function drawExplosions(world, ctx, camX, camY) {
    ctx.save();

    for (const ex of world.explosions) {
        for (const p of ex.particles) {
            if (p.life <= 0) continue;

            const alpha = p.life;
            const col = p.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");

            ctx.fillStyle = col;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 20 * alpha;

            ctx.beginPath();
            ctx.arc(p.x - camX, p.y - camY, 5 * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}
