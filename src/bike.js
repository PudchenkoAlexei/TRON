import { BIKE_SPEED, TURN_SPEED, TRAIL_STEP, WORLD_SIZE, TRAIL_MAX_POINTS } from './config.js';
import { wrapCoord } from './util.js';

export default class Bike {
    constructor(x, y, angle, color, options = {}) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.color = color;
        this.isPlayer = options.isPlayer ?? false;
        this.type = options.type ?? 'default';
        this.alive = true;
        this.trail = [];
        this._trailDistAcc = 0;
    }

    resetTrail() {
        this.trail = [];
        this._trailDistAcc = 0;
    }

    update(dt, controlInput = null) {
        if (!this.alive) return;

        if (this.isPlayer && controlInput) {
            if (controlInput.left) this.angle -= TURN_SPEED * dt;
            if (controlInput.right) this.angle += TURN_SPEED * dt;
        }

        const vx = Math.cos(this.angle) * BIKE_SPEED;
        const vy = Math.sin(this.angle) * BIKE_SPEED;

        const oldX = this.x;
        const oldY = this.y;

        this.x += vx * dt;
        this.y += vy * dt;

        this.x = wrapCoord(this.x, WORLD_SIZE);
        this.y = wrapCoord(this.y, WORLD_SIZE);

        const dx = this.x - oldX;
        const dy = this.y - oldY;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        this._trailDistAcc += segLen;

        if (this.trail.length === 0) {
            this.trail.push({ x: this.x, y: this.y });
            this._trailDistAcc = 0;
        } else if (this._trailDistAcc >= TRAIL_STEP) {
            this.trail.push({ x: this.x, y: this.y });
            this._trailDistAcc = 0;

            if (this.trail.length > TRAIL_MAX_POINTS) {
                this.trail.shift();
            }
        }
    }
}
