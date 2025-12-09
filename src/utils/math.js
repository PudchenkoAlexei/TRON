export function wrapCoord(value, worldSize) {
    if (value < -worldSize / 2) return value + worldSize;
    if (value > worldSize / 2) return value - worldSize;
    return value;
}

export function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}

export function pointSegmentDist2(px, py, a, c) {
    const vx = c.x - a.x;
    const vy = c.y - a.y;
    const ux = px - a.x;
    const uy = py - a.y;
    const t = Math.max(0, Math.min(1, (ux*vx + uy*vy)/(vx*vx + vy*vy)));
    const dx = a.x + vx*t - px;
    const dy = a.y + vy*t - py;
    return dx*dx + dy*dy;
}
