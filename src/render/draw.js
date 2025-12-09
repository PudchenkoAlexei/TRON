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

        const sx = bonus.x - camX;
        const sy = bonus.y - camY;

        if (bonus.type === "speed") {
            ctx.fillStyle = "#ff9933";
            ctx.shadowColor = "#ff6600";
        } else if (bonus.type === "long_trail") {
            ctx.fillStyle = "#99ff66";
            ctx.shadowColor = "#55ff22";
        }

        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
