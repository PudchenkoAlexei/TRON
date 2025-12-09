import { dist2, pointSegmentDist2 } from "../utils/math.js";
import { COLLISION_RADIUS, BIKE_BODY_RADIUS } from "../core/config.js";

export function checkCollisions(world) {
    const CR2 = COLLISION_RADIUS * COLLISION_RADIUS;
    const BR2 = BIKE_BODY_RADIUS * BIKE_BODY_RADIUS;

    for (const bike of world.bikes) {
        if (!bike.alive) continue;

        for (const other of world.bikes) {
            const trail = other.trail;
            for (let i = 0; i < trail.length; i++) {
                if (other === bike && i > trail.length - 10) continue;
                if (dist2(bike, trail[i]) < CR2) {
                    bike.alive = false;
                    break;
                }
            }
            if (!bike.alive) break;
        }
    }

    for (let i = 0; i < world.bikes.length; i++) {
        const a = world.bikes[i];
        if (!a.alive) continue;
        for (let j = i + 1; j < world.bikes.length; j++) {
            const b = world.bikes[j];
            if (!b.alive) continue;
            if (dist2(a, b) < BR2 * 4) {
                a.alive = false;
                b.alive = false;
            }
        }
    }

    for (const bike of world.bikes) {
        if (!bike.alive) continue;

        for (const ob of world.obstacles) {
            if (ob.type === "wall") {
                if (pointSegmentDist2(bike.x, bike.y, ob.points[0], ob.points[1]) < 160)
                    bike.alive = false;
            }
            else if (ob.type === "poly") {
                if (polyHit(bike, ob.points)) bike.alive = false;
            }
            else if (ob.type === "shape_with_hole") {
                if (polyHit(bike, ob.outer)) bike.alive = false;
            }
            if (!bike.alive) break;
        }
    }
}

function polyHit(b, pts) {
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const c = pts[(i + 1) % pts.length];
        if (pointSegmentDist2(b.x, b.y, a, c) < 160) return true;
    }
    return false;
}
