import { WORLD_SIZE } from "./config.js";

const PLAYER_SAFE_RADIUS = 500;
const MIN_OBSTACLE_DISTANCE = 250;

export function randomObstacles() {
    const count = 8 + Math.floor(Math.random() * 7);
    const list = [];

    for (let i = 0; i < count; i++) {
        let shape;
        let tries = 0;

        while (tries < 40) {
            const t = Math.random();
            if (t < 0.33) shape = makeWall();
            else if (t < 0.66) shape = makeRectangle();
            else shape = makeShapeWithHole();

            if (tooCloseToPlayer(shape)) {
                tries++;
                continue;
            }

            let overlap = false;
            for (const ex of list) {
                if (shapesOverlap(shape, ex)) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) {
                list.push(shape);
                break;
            }
            tries++;
        }
    }
    return list;
}

function rnd(a, b) {
    return a + Math.random() * (b - a);
}

function centerOfShape(shape) {
    if (shape.type === "wall") {
        return {
            x: (shape.points[0].x + shape.points[1].x) / 2,
            y: (shape.points[0].y + shape.points[1].y) / 2
        };
    }
    if (shape.type === "poly") {
        let sx = 0, sy = 0;
        for (const p of shape.points) {
            sx += p.x;
            sy += p.y;
        }
        return { x: sx / shape.points.length, y: sy / shape.points.length };
    }
    if (shape.type === "shape_with_hole") {
        let sx = 0, sy = 0;
        for (const p of shape.outer) {
            sx += p.x;
            sy += p.y;
        }
        return { x: sx / shape.outer.length, y: sy / shape.outer.length };
    }
}

function dist2Points(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function tooCloseToPlayer(shape) {
    const c = centerOfShape(shape);
    return dist2Points(c, {x:0, y:0}) < PLAYER_SAFE_RADIUS * PLAYER_SAFE_RADIUS;
}

function shapesOverlap(a, b) {
    const ca = centerOfShape(a);
    const cb = centerOfShape(b);
    return dist2Points(ca, cb) < MIN_OBSTACLE_DISTANCE * MIN_OBSTACLE_DISTANCE;
}

function makeWall() {
    const x1 = rnd(-WORLD_SIZE/2, WORLD_SIZE/2);
    const y1 = rnd(-WORLD_SIZE/2, WORLD_SIZE/2);
    const length = rnd(180, 420);
    const ang = Math.random() * Math.PI * 2;
    return {
        type: "wall",
        points: [
            {x: x1, y: y1},
            {x: x1 + Math.cos(ang)*length, y: y1 + Math.sin(ang)*length}
        ]
    };
}

function makeRectangle() {
    const cx = rnd(-WORLD_SIZE/2, WORLD_SIZE/2);
    const cy = rnd(-WORLD_SIZE/2, WORLD_SIZE/2);
    const w = rnd(150, 260);
    const h = rnd(90, 180);
    return {
        type: "poly",
        points: [
            {x: cx-w/2, y: cy-h/2},
            {x: cx+w/2, y: cy-h/2},
            {x: cx+w/2, y: cy+h/2},
            {x: cx-w/2, y: cy+h/2}
        ]
    };
}

function makeShapeWithHole() {
    const cx = rnd(-WORLD_SIZE/2, WORLD_SIZE/2);
    const cy = rnd(-WORLD_SIZE/2, WORLD_SIZE/2);

    const outer = [];
    const inner = [];

    const outerSides = 5 + Math.floor(Math.random()*3);
    const innerSides = 3 + Math.floor(Math.random()*3);

    for (let i = 0; i < outerSides; i++) {
        const ang = (i / outerSides) * Math.PI * 2;
        outer.push({
            x: cx + Math.cos(ang) * rnd(150, 230),
            y: cy + Math.sin(ang) * rnd(150, 230)
        });
    }

    for (let i = 0; i < innerSides; i++) {
        const ang = (i / innerSides) * Math.PI * 2;
        inner.push({
            x: cx + Math.cos(ang) * rnd(40, 80),
            y: cy + Math.sin(ang) * rnd(40, 80)
        });
    }

    return {
        type: "shape_with_hole",
        outer,
        inner
    };
}
