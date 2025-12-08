import { BIKE_SPEED } from './config.js';

export function updateBotAI(bike, world, dt) {
    const player = world.player;
    if (!player || !player.alive || !bike.alive) return;

    const lookAheadTime = bike.type === 'aggressive' ? 1.4 : 1.0;

    const targetX = player.x + Math.cos(player.angle) * BIKE_SPEED * lookAheadTime;
    const targetY = player.y + Math.sin(player.angle) * BIKE_SPEED * lookAheadTime;

    const dirX = targetX - bike.x;
    const dirY = targetY - bike.y;
    const targetAngle = Math.atan2(dirY, dirX);

    let angleDiff = targetAngle - bike.angle;
    angleDiff = (angleDiff + Math.PI) % (2 * Math.PI) - Math.PI;

    const turnSpeed = Math.PI;

    if (angleDiff > 0.1) bike.angle += turnSpeed * dt;
    else if (angleDiff < -0.1) bike.angle -= turnSpeed * dt;
}
