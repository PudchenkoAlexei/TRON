import { WORLD_SIZE } from "./config.js";

export function randomObstacles() {
    const count = 4 + Math.floor(Math.random() * 4);
    const list = [];

    for (let i = 0; i < count; i++) {
        const t = Math.random();
        if (t < 0.33) list.push(makeWall());
        else if (t < 0.66) list.push(makeRectangle());
        else list.push(makeShapeWithHole());
    }
    return list;
}

function rnd(a, b) {
    return a + Math.random() * (b - a);
}

function makeWall() {
    const x1 = rnd(-WORLD_SIZE/2, WORLD_SIZE/2);
    const y1 = rnd(-WORLD_SIZE/2, WORLD_SIZE/2);
    const length = rnd(150, 350);
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
            x: cx + Math.cos(ang) * rnd(140, 200),
            y: cy + Math.sin(ang) * rnd(140, 200)
        });
    }

    for (let i = 0; i < innerSides; i++) {
        const ang = (i / innerSides) * Math.PI * 2;
        inner.push({
            x: cx + Math.cos(ang) * rnd(40, 70),
            y: cy + Math.sin(ang) * rnd(40, 70)
        });
    }

    return {
        type: "shape_with_hole",
        outer,
        inner
    };
}
