import { WORLD_SIZE } from "../core/config.js";

const BONUS_RADIUS = 18;
const BONUS_EFFECT_TIME = 5;
const HALF = WORLD_SIZE / 2;

export function spawnInitialBonuses(world) {
    world.bonuses = [
        makeBonus("speed", world),
        makeBonus("long_trail", world)
    ];
}

function randomPos() {
    return {
        x: Math.random() * WORLD_SIZE - HALF,
        y: Math.random() * WORLD_SIZE - HALF
    };
}

// -----------------------------
//  Точна перевірка: точка всередині полігону
// -----------------------------
function pointInPoly(px, py, pts) {
    let inside = false;

    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i].x, yi = pts[i].y;
        const xj = pts[j].x, yj = pts[j].y;

        const intersect =
            (yi > py) !== (yj > py) &&
            px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
    }
    return inside;
}

// -----------------------------
//  Точна перевірка перешкоди
// -----------------------------
function insideObstacle(x, y, ob) {
    if (ob.type === "wall") {
        const a = ob.points[0], c = ob.points[1];
        const t = ((x-a.x)*(c.x-a.x)+(y-a.y)*(c.y-a.y)) /
                  ((c.x-a.x)**2 + (c.y-a.y)**2);
        const clx = a.x + (c.x-a.x)*t;
        const cly = a.y + (c.y-a.y)*t;
        const dx = x - clx, dy = y - cly;
        return dx*dx + dy*dy < 300;
    }

    if (ob.type === "poly") {
        if (pointInPoly(x, y, ob.points)) return true;
        return false;
    }

    if (ob.type === "shape_with_hole") {
        const inOuter = pointInPoly(x, y, ob.outer);
        const inInner = pointInPoly(x, y, ob.inner);

        if (inOuter && !inInner) return true;  // всередині фігури — погано
        return false;
    }

    return false;
}

function posFree(world, pos) {
    for (const ob of world.obstacles)
        if (insideObstacle(pos.x, pos.y, ob)) return false;
    return true;
}

// -----------------------------
//  Генерація бонусу
// -----------------------------
function makeBonus(type, world) {
    let pos = {x: 0, y: 0};

    for (let i = 0; i < 100; i++) {
        pos = randomPos();
        if (posFree(world, pos)) break;
    }

    return {
        type,
        x: pos.x,
        y: pos.y,
        alive: true
    };
}

// -----------------------------
//  Оновлення бонусів
// -----------------------------
export function updateBonuses(world, dt) {
    for (const bike of world.bikes) {
        if (!bike.alive) continue;

        for (const bonus of world.bonuses) {
            if (!bonus.alive) continue;

            const dx = bike.x - bonus.x;
            const dy = bike.y - bonus.y;
            if (dx*dx + dy*dy < BONUS_RADIUS*BONUS_RADIUS) {
                bonus.alive = false;
                activateBonus(bike, bonus.type);
            }
        }
    }

    updateTimers(world.bikes, dt);
}

function activateBonus(bike, type) {
    if (!bike.activeBonuses) bike.activeBonuses = {};

    bike.activeBonuses[type] = BONUS_EFFECT_TIME;

    recalcStats(bike);
}

function updateTimers(bikes, dt) {
    for (const b of bikes) {
        if (!b.activeBonuses) continue;

        for (const key in b.activeBonuses) {
            b.activeBonuses[key] -= dt;
            if (b.activeBonuses[key] <= 0) delete b.activeBonuses[key];
        }

        recalcStats(b);
    }
}

function recalcStats(bike) {
    bike.speedMultiplier = 1;
    bike.trailMultiplier = 1;

    if (!bike.activeBonuses) return;

    if (bike.activeBonuses.speed > 0)
        bike.speedMultiplier = 2;

    if (bike.activeBonuses.long_trail > 0)
        bike.trailMultiplier = 2;
}
