import { COLLISION_RADIUS, BIKE_BODY_RADIUS, BIKE_SEPARATION_RADIUS } from './config.js';

function norm(a) {
    return (a + Math.PI) % (2 * Math.PI) - Math.PI;
}

function checkStaticCollision(x, y, world, self) {
    const trailR2 = (COLLISION_RADIUS * 2.3) ** 2;
    for (const b of world.bikes) {
        const t = b.trail;
        const len = t.length;
        for (let i = 0; i < len; i++) {
            if (b === self && i > len - 10) continue;
            const dx = x - t[i].x;
            const dy = y - t[i].y;
            if (dx * dx + dy * dy < trailR2) return true;
        }
    }
    const bodyR2 = (BIKE_BODY_RADIUS * 1.6) ** 2;
    for (const b of world.bikes) {
        if (!b.alive || b === self) continue;
        const dx = x - b.x;
        const dy = y - b.y;
        if (dx * dx + dy * dy < bodyR2) return true;
    }
    return false;
}

function scanDirection(bike, world, ang) {
    let depth = 0;
    const step = 10;
    const maxD = 360;
    for (let d = step; d <= maxD; d += step) {
        const x = bike.x + Math.cos(ang) * d;
        const y = bike.y + Math.sin(ang) * d;
        if (checkStaticCollision(x, y, world, bike)) break;
        depth = d;
    }
    return depth;
}

function nearestObstacleDist2(bike, world) {
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
    for (const b of world.bikes) {
        if (!b.alive || b === bike) continue;
        const dx = bike.x - b.x;
        const dy = bike.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < best) best = d2;
    }
    return best;
}

function separationPenalty(bike, world, ang) {
    let penalty = 0;
    const sepR2 = BIKE_SEPARATION_RADIUS * BIKE_SEPARATION_RADIUS;
    for (const other of world.bikes) {
        if (!other.alive || other === bike) continue;
        const dx = other.x - bike.x;
        const dy = other.y - bike.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > sepR2) continue;
        const dirToOther = Math.atan2(dy, dx);
        const diff = Math.abs(norm(ang - dirToOther));
        const w = (sepR2 - d2) / sepR2;
        penalty += (Math.PI - diff) * w * 40;
    }
    return penalty;
}

export function updateBotAI(bike, world, dt) {
    const p = world.player;
    if (!p || !p.alive || !bike.alive) return;

    const dx = p.x - bike.x;
    const dy = p.y - bike.y;
    const distP2 = dx * dx + dy * dy;

    const targetAng = Math.atan2(dy, dx);
    const travelAng = bike.angle;

    const obsD2 = nearestObstacleDist2(bike, world);
    const danger = obsD2 < 200 * 200;
    const panic = obsD2 < 120 * 120;

    const scans = 51;
    const halfSector = Math.PI * 1.0;
    const step = (halfSector * 2) / (scans - 1);

    let bestScore = -999999;
    let bestAng = bike.angle;

    const centers = [targetAng, travelAng];

    for (const center of centers) {
        for (let i = 0; i < scans; i++) {
            const ang = center - halfSector + i * step;

            const depth = scanDirection(bike, world, ang);
            if (depth < 30) continue;

            let score = 0;

            const safeWeight = panic ? 5.0 : danger ? 3.0 : 2.0;
            score += depth * safeWeight;

            const diffToPlayer = Math.abs(norm(ang - targetAng));
            const attackBase =
                distP2 > 900 * 900 ? 170 :
                distP2 > 600 * 600 ? 140 :
                distP2 > 400 * 400 ? 115 : 100;
            const attackWeight = panic ? attackBase * 0.3 : danger ? attackBase * 0.55 : attackBase;
            score += (Math.PI - diffToPlayer) * attackWeight;

            const diffTurn = Math.abs(norm(ang - bike.angle));
            const turnPenalty = panic ? 12 : 22;
            score -= diffTurn * turnPenalty;

            const sepPen = separationPenalty(bike, world, ang);
            score -= sepPen;

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
