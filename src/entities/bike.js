import { BIKE_SPEED, TURN_SPEED, TRAIL_STEP, WORLD_SIZE, TRAIL_MAX_POINTS } from "../core/config.js";
import { wrapCoord } from "../utils/math.js";

export default class Bike {
    constructor(x, y, angle, color, options = {}) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.color = color;

        this.isPlayer = options.isPlayer ?? false;
        this.isPlayer2 = options.isPlayer2 ?? false;
        this.type = options.type ?? "default";

        this.alive = true;
        this.trail = [];
        this._trailDistAcc = 0;

        this.speedMultiplier = 1;
        this.trailMultiplier = 1;
        this.activeBonuses = options.activeBonuses ?? null;
    }

    resetTrail() {
        this.trail = [];
        this._trailDistAcc = 0;
    }

    update(dt, control = null) {
        if (!this.alive) return;

        if (control) {
            if (control.left) this.angle -= TURN_SPEED * dt;
            if (control.right) this.angle += TURN_SPEED * dt;
        }

        const vx = Math.cos(this.angle) * (BIKE_SPEED * this.speedMultiplier);
        const vy = Math.sin(this.angle) * (BIKE_SPEED * this.speedMultiplier);

        const px = this.x;
        const py = this.y;

        this.x += vx * dt;
        this.y += vy * dt;

        this.x = wrapCoord(this.x, WORLD_SIZE);
        this.y = wrapCoord(this.y, WORLD_SIZE);

        const dx = this.x - px;
        const dy = this.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this._trailDistAcc += dist;

        if (this.trail.length === 0) {
            this.trail.push({ x: this.x, y: this.y });
            this._trailDistAcc = 0;
        } else if (this._trailDistAcc >= TRAIL_STEP / this.trailMultiplier) {
            this.trail.push({ x: this.x, y: this.y });
            this._trailDistAcc = 0;

            if (this.trail.length > TRAIL_MAX_POINTS * this.trailMultiplier)
                this.trail.shift();
        }
    }
}
