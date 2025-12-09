import { WORLD_SIZE } from "../core/config.js";

const SAFE_ENTITY_RADIUS = 450;
const MIN_OBSTACLE_DISTANCE = 250;

const HALF = WORLD_SIZE / 2;
const BORDER_PADDING = 40;

export function randomObstacles(world) {
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

            if (!shapeInsideMap(shape)) {
                tries++;
                continue;
            }

            if (tooCloseToAnyBike(shape, world.bikes)) {
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

function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function tooCloseToAnyBike(shape, bikes) {
    const c = centerOfShape(shape);
    for (const bike of bikes) {
        if (dist2(c, bike) < SAFE_ENTITY_RADIUS * SAFE_ENTITY_RADIUS)
            return true;
    }
    return false;
}

function shapesOverlap(a, b) {
    const ca = centerOfShape(a);
    const cb = centerOfShape(b);
    return dist2(ca, cb) < MIN_OBSTACLE_DISTANCE * MIN_OBSTACLE_DISTANCE;
}

function shapeInsideMap(shape) {
    const pts = (shape.type === "shape_with_hole")
        ? shape.outer
        : (shape.type === "poly" ? shape.points : shape.points);

    for (const p of pts) {
        if (p.x < -HALF + BORDER_PADDING) return false;
        if (p.x >  HALF - BORDER_PADDING) return false;
        if (p.y < -HALF + BORDER_PADDING) return false;
        if (p.y >  HALF - BORDER_PADDING) return false;
    }

    return true;
}

function makeWall() {
    const length = rnd(180, 420);
    const ang = Math.random() * Math.PI * 2;

    const cx = rnd(-HALF + BORDER_PADDING, HALF - BORDER_PADDING);
    const cy = rnd(-HALF + BORDER_PADDING, HALF - BORDER_PADDING);

    const x1 = cx - Math.cos(ang) * length * 0.5;
    const y1 = cy - Math.sin(ang) * length * 0.5;
    const x2 = cx + Math.cos(ang) * length * 0.5;
    const y2 = cy + Math.sin(ang) * length * 0.5;

    return {
        type: "wall",
        points: [
            { x: x1, y: y1 },
            { x: x2, y: y2 }
        ]
    };
}

function makeRectangle() {
    const w = rnd(150, 260);
    const h = rnd(90, 180);

    const cx = rnd(-HALF + BORDER_PADDING + w/2, HALF - BORDER_PADDING - w/2);
    const cy = rnd(-HALF + BORDER_PADDING + h/2, HALF - BORDER_PADDING - h/2);

    return {
        type: "poly",
        points: [
            { x: cx - w/2, y: cy - h/2 },
            { x: cx + w/2, y: cy - h/2 },
            { x: cx + w/2, y: cy + h/2 },
            { x: cx - w/2, y: cy + h/2 }
        ]
    };
}

function makeShapeWithHole() {
    const R = rnd(150, 230);
    const r = rnd(40, 80);

    const cx = rnd(-HALF + BORDER_PADDING + R, HALF - BORDER_PADDING - R);
    const cy = rnd(-HALF + BORDER_PADDING + R, HALF - BORDER_PADDING - R);

    const outer = [];
    const inner = [];

    const outerSides = 5 + Math.floor(Math.random() * 3);
    const innerSides = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < outerSides; i++) {
        const ang = (i / outerSides) * Math.PI * 2;
        outer.push({
            x: cx + Math.cos(ang) * R,
            y: cy + Math.sin(ang) * R
        });
    }

    for (let i = 0; i < innerSides; i++) {
        const ang = (i / innerSides) * Math.PI * 2;
        inner.push({
            x: cx + Math.cos(ang) * r,
            y: cy + Math.sin(ang) * r
        });
    }

    return {
        type: "shape_with_hole",
        outer,
        inner
    };
}
