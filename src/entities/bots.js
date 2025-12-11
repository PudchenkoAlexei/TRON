import {
    COLLISION_RADIUS,
    BIKE_BODY_RADIUS,
    BIKE_SEPARATION_RADIUS,
    BIKE_SPEED
} from "../core/config.js";
import { pointSegmentDist2 } from "../utils/math.js";

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

    for (const ob of world.obstacles) {
        if (ob.type === "wall") {
            if (pointSegmentDist2(x, y, ob.points[0], ob.points[1]) < 260)
                return true;
        }
        else if (ob.type === "poly") {
            if (polylineCollision(x, y, ob.points)) return true;
        }
        else if (ob.type === "shape_with_hole") {
            if (polylineCollision(x, y, ob.outer)) return true;
        }
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

    for (const ob of world.obstacles) {
        if (ob.type === "wall") {
            best = Math.min(best, pointSegmentDist2(bike.x, bike.y, ob.points[0], ob.points[1]));
        }
        else if (ob.type === "poly") {
            best = Math.min(best, polyMinDist2(bike, ob.points));
        }
        else if (ob.type === "shape_with_hole") {
            best = Math.min(best, polyMinDist2(bike, ob.outer));
        }
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

function predictPlayerPosition(player, t) {
    const speed = BIKE_SPEED * (player.speedMultiplier || 1);
    const dx = Math.cos(player.angle) * speed * t;
    const dy = Math.sin(player.angle) * speed * t;
    return { x: player.x + dx, y: player.y + dy };
}

function findTargetBonus(bike, world) {
    let best = null;
    let bestD2 = Infinity;

    for (const bonus of world.bonuses) {
        if (!bonus.alive) continue;

        const dx = bonus.x - bike.x;
        const dy = bonus.y - bike.y;
        const d2 = dx * dx + dy * dy;

        if (d2 > 900 * 900) continue;

        if (d2 < bestD2) {
            bestD2 = d2;
            best = bonus;
        }
    }

    return { bonus: best, dist2: bestD2 };
}

function corridorPenalty(depth) {
    if (depth >= 260) return 0;
    if (depth <= 80) return 120;
    const k = (260 - depth) / (260 - 80);
    return k * 80;
}

export function updateBotAI(bike, world, dt) {
    const p = world.player;
    if (!p || !p.alive || !bike.alive) return;

    const dx = p.x - bike.x;
    const dy = p.y - bike.y;
    const distP2 = dx * dx + dy * dy;
    const distP = Math.sqrt(distP2);

    const tHorizon = Math.min(Math.max(distP / 400, 0.25), 1.1);
    const pred = predictPlayerPosition(p, tHorizon);
    const targetAngPred = Math.atan2(pred.y - bike.y, pred.x - bike.x);

    const travelAng = bike.angle;

    const obsD2 = nearestObstacleDist2(bike, world);
    const danger = obsD2 < 200 * 200;
    const panic = obsD2 < 120 * 120;

    const { bonus: targetBonus, dist2: distBonus2 } = findTargetBonus(bike, world);
    let bonusAng = null;
    if (targetBonus) {
        bonusAng = Math.atan2(targetBonus.y - bike.y, targetBonus.x - bike.x);
    }

    const scans = 49;
    const halfSector = Math.PI * 1.0;
    const step = (halfSector * 2) / (scans - 1);

    let bestScore = -Infinity;
    let bestAng = bike.angle;

    const centers = [targetAngPred, travelAng];
    if (bonusAng !== null) centers.push(bonusAng);

    for (const center of centers) {
        for (let i = 0; i < scans; i++) {
            const ang = center - halfSector + i * step;
            const depth = scanDirection(bike, world, ang);

            if (depth < 30) continue;

            let score = 0;

            const safeW = panic ? 5.0 : danger ? 3.0 : 2.0;
            score += depth * safeW;

            score -= corridorPenalty(depth);

            const diffToPlayerPred = Math.abs(norm(ang - targetAngPred));
            const attackBase =
                distP2 > 900 * 900 ? 180 :
                distP2 > 600 * 600 ? 150 :
                distP2 > 400 * 400 ? 120 : 95;

            const attackW = panic
                ? attackBase * 0.30
                : danger
                    ? attackBase * 0.55
                    : attackBase;

            score += (Math.PI - diffToPlayerPred) * attackW;

            if (bonusAng !== null && !panic) {
                const diffToBonus = Math.abs(norm(ang - bonusAng));
                if (distBonus2 < 700 * 700) {
                    const bonusBase =
                        distBonus2 < 300 * 300 ? 150 :
                        distBonus2 < 500 * 500 ? 110 :
                        80;
                    const bonusW = danger ? bonusBase * 0.5 : bonusBase;
                    score += (Math.PI - diffToBonus) * bonusW;
                }
            }

            const diffTurn = Math.abs(norm(ang - bike.angle));
            const turnPenalty = panic ? 10 : 20;
            score -= diffTurn * turnPenalty;

            score -= separationPenalty(bike, world, ang);

            score += Math.random() * 8;

            if (score > bestScore) {
                bestScore = score;
                bestAng = ang;
            }
        }
    }

    const diff = norm(bestAng - bike.angle);
    const turnSpeed = panic ? Math.PI * 2.4 : danger ? Math.PI * 1.9 : Math.PI * 1.5;

    if (diff > 0.05) bike.angle += turnSpeed * dt;
    else if (diff < -0.05) bike.angle -= turnSpeed * dt;
}

function polylineCollision(x, y, pts) {
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const c = pts[(i + 1) % pts.length];
        if (pointSegmentDist2(x, y, a, c) < 260) return true;
    }
    return false;
}

function polyMinDist2(bike, pts) {
    let best = Infinity;
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i], c = pts[(i + 1) % pts.length];
        best = Math.min(best, pointSegmentDist2(bike.x, bike.y, a, c));
    }
    return best;
}
