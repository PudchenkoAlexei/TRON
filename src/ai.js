import { COLLISION_RADIUS } from './config.js';

function checkCollision(x, y, world, self) {
    const r2 = (COLLISION_RADIUS * 2.3) ** 2;
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

function scan(bike, world, ang) {
    let depth = 0;
    const step = 10;
    const maxD = 360;
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

function norm(a) {
    return (a + Math.PI) % (2 * Math.PI) - Math.PI;
}

export function updateBotAI(bike, world, dt) {
    const p = world.player;
    if (!p || !p.alive || !bike.alive) return;

    const dx = p.x - bike.x;
    const dy = p.y - bike.y;
    const distP2 = dx * dx + dy * dy;

    const targetAng = Math.atan2(dy, dx);
    const travelAng = bike.angle;

    const wallD2 = nearestWallDist2(bike, world);
    const danger = wallD2 < 200 * 200;
    const panic = wallD2 < 120 * 120;

    const scans = 51;
    const halfSector = Math.PI * 1.0;
    const step = (halfSector * 2) / (scans - 1);

    let bestScore = -999999;
    let bestAng = bike.angle;

    for (const center of [targetAng, travelAng]) {
        for (let i = 0; i < scans; i++) {
            const ang = center - halfSector + i * step;

            const depth = scan(bike, world, ang);
            if (depth < 30) continue;

            let score = 0;

            const safeWeight = panic ? 5.0 : danger ? 3.2 : 2.0;
            score += depth * safeWeight;

            let diffToPlayer = Math.abs(norm(ang - targetAng));
            const attackBase =
                distP2 > 900 * 900 ? 170 :
                distP2 > 600 * 600 ? 140 :
                distP2 > 400 * 400 ? 115 : 100;

            const attackWeight = panic ? attackBase * 0.3 : danger ? attackBase * 0.55 : attackBase;
            score += (Math.PI - diffToPlayer) * attackWeight;

            const turnPenalty = panic ? 12 : 22;
            score -= Math.abs(norm(ang - bike.angle)) * turnPenalty;

            if (score > bestScore) {
                bestScore = score;
                bestAng = ang;
            }
        }
    }

    const diff = norm(bestAng - bike.angle);
    const turnSpeed = panic ? Math.PI * 2.3 : danger ? Math.PI * 1.9 : Math.PI * 1.5;

    if (diff > 0.05) bike.angle += turnSpeed * dt;
    else if (diff < -0.05) bike.angle -= turnSpeed * dt;
}
