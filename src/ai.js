import { COLLISION_RADIUS } from './config.js';

function checkCollision(x, y, world, self) {
    const r2 = (COLLISION_RADIUS * 2.2) ** 2;
    for (const b of world.bikes) {
        const t = b.trail;
        const len = t.length;
        for (let i = 0; i < len; i++) {
            if (b === self && i > len - 10) continue;
            const dx = x - t[i].x;
            const dy = y - t[i].y;
            if (dx * dx + dy * dy < r2) return true;
        }
    }
    return false;
}

function scanDirection(bike, world, ang) {
    let depth = 0;
    const step = 14;
    const maxD = 260;
    for (let d = step; d <= maxD; d += step) {
        const x = bike.x + Math.cos(ang) * d;
        const y = bike.y + Math.sin(ang) * d;
        if (checkCollision(x, y, world, bike)) break;
        depth = d;
    }
    return depth;
}

function nearestWallDist2(bike, world) {
    let best = Infinity;
    for (const b of world.bikes) {
        const t = b.trail;
        const len = t.length;
        for (let i = 0; i < len; i++) {
            if (b === bike && i > len - 10) continue;
            const dx = bike.x - t[i].x;
            const dy = bike.y - t[i].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < best) best = d2;
        }
    }
    return best;
}

export function updateBotAI(bike, world, dt) {
    const p = world.player;
    if (!p || !p.alive || !bike.alive) return;

    const dx = p.x - bike.x;
    const dy = p.y - bike.y;
    const distP2 = dx * dx + dy * dy;
    const targetAng = Math.atan2(dy, dx);

    const nearWall = nearestWallDist2(bike, world) < 130 * 130;
    const panic = nearestWallDist2(bike, world) < 90 * 90;

    const scans = 35;
    const halfSector = Math.PI * 0.85;
    const step = (halfSector * 2) / (scans - 1);

    let bestAng = bike.angle;
    let bestScore = -999999;

    for (let i = 0; i < scans; i++) {
        const ang = bike.angle - halfSector + i * step;
        const depth = scanDirection(bike, world, ang);

        if (depth < 30) continue;

        let score = depth * 2.5;

        let diffAttack = (ang - targetAng + Math.PI) % (2 * Math.PI) - Math.PI;
        const attackBias = distP2 < 700 * 700 ? 140 : 90;
        score += (Math.PI - Math.abs(diffAttack)) * attackBias;

        if (nearWall) {
            let diffTurn = (ang - bike.angle + Math.PI) % (2 * Math.PI) - Math.PI;
            score -= Math.abs(diffTurn) * 25;
        }

        if (panic) score -= Math.abs((ang - bike.angle)) * 70;

        if (score > bestScore) {
            bestScore = score;
            bestAng = ang;
        }
    }

    let diff = (bestAng - bike.angle + Math.PI) % (2 * Math.PI) - Math.PI;
    const turnSpeed = panic ? Math.PI * 2.0 : Math.PI * 1.4;

    if (diff > 0.06) bike.angle += turnSpeed * dt;
    else if (diff < -0.06) bike.angle -= turnSpeed * dt;
}
