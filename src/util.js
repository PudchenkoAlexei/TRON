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
