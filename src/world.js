import Bike from './bike.js';
import { updateBotAI } from './ai.js';
import {
    WORLD_SIZE,
    COLLISION_RADIUS,
    BONUS_TYPES,
    BONUS_LIFETIME,
    BONUS_SPAWN_INTERVAL,
    MAX_BOTS,
    BIKE_BODY_RADIUS
} from './config.js';
import { dist2 } from './util.js';
import { randomObstacles } from "./obstacles.js";

const COLLISION_RADIUS2 = COLLISION_RADIUS * COLLISION_RADIUS;
const BIKE_BODY_RADIUS2 = BIKE_BODY_RADIUS * BIKE_BODY_RADIUS;

function createBonus(x, y, type) {
    return {
        x,
        y,
        type,
        alive: true,
        timeLeft: BONUS_LIFETIME
    };
}

function getSpawnPositions(count) {
    const radius = WORLD_SIZE / 4;
    const positions = [];
    const step = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
        const ang = i * step;
        const x = Math.cos(ang) * radius;
        const y = Math.sin(ang) * radius;
        positions.push({ x, y });
    }
    return positions;
}

export default class World {
    constructor() {
        this.bikes = [];
        this.player = null;
        this.gameOver = false;
        this.winner = null;
        this.bonuses = [];
        this.obstacles = [];
        this._bonusSpawnTimer = BONUS_SPAWN_INTERVAL;
        this.statusMessage = '';
    }

    init() {
        this.bikes = [];
        this.bonuses = [];
        this.obstacles = randomObstacles();
        this.gameOver = false;
        this.winner = null;
        this._bonusSpawnTimer = BONUS_SPAWN_INTERVAL;

        const total = MAX_BOTS + 1;
        const positions = getSpawnPositions(total);

        const p = positions[0];
        const pAng = Math.atan2(-p.y, -p.x);
        this.player = new Bike(p.x, p.y, pAng, '#00ffff', { isPlayer: true });
        this.player.resetTrail();
        this.bikes.push(this.player);

        for (let i = 1; i <= MAX_BOTS; i++) {
            const pos = positions[i];
            const ang = Math.atan2(-pos.y, -pos.x);
            const bot = new Bike(pos.x, pos.y, ang, '#ff00ff', { type: 'aggressive' });
            bot.resetTrail();
            this.bikes.push(bot);
        }

        const S = WORLD_SIZE / 2;

        this.obstacles.push({
            type: "wall",
            points: [ {x: -S, y: -S}, {x:  S, y: -S} ]
        });
        this.obstacles.push({
            type: "wall",
            points: [ {x:  S, y: -S}, {x:  S, y:  S} ]
        });
        this.obstacles.push({
            type: "wall",
            points: [ {x:  S, y:  S}, {x: -S, y:  S} ]
        });
        this.obstacles.push({
            type: "wall",
            points: [ {x: -S, y:  S}, {x: -S, y: -S} ]
        });

        this.statusMessage = 'Гра йде...';
    }

    update(dt, inputState) {
        if (this.gameOver) return;

        this.updateBonuses(dt);

        for (const bike of this.bikes) {
            if (!bike.isPlayer) updateBotAI(bike, this, dt);
        }

        for (const bike of this.bikes) {
            if (bike.isPlayer) bike.update(dt, inputState);
            else bike.update(dt);
        }

        this.checkCollisions();

        const alive = this.bikes.filter(b => b.alive);
        if (alive.length <= 1) {
            this.gameOver = true;
            this.winner = alive[0] || null;
            if (!this.player.alive) this.statusMessage = 'Ти програв 😢 (натисни R)';
            else this.statusMessage = 'Ти переміг! 🎉 (натисни R)';
        }
    }

    updateBonuses(dt) {
        for (const bonus of this.bonuses) {
            if (!bonus.alive) continue;
            bonus.timeLeft -= dt;
            if (bonus.timeLeft <= 0) bonus.alive = false;
        }

        this._bonusSpawnTimer -= dt;
        if (this._bonusSpawnTimer <= 0) {
            this.spawnRandomBonus();
            this._bonusSpawnTimer = BONUS_SPAWN_INTERVAL;
        }
    }

    spawnRandomBonus() {
        const x = (Math.random() - 0.5) * WORLD_SIZE;
        const y = (Math.random() - 0.5) * WORLD_SIZE;
        const type = BONUS_TYPES.SPEED;
        const bonus = createBonus(x, y, type);
        this.bonuses.push(bonus);
    }

    checkCollisions() {
        for (const bike of this.bikes) {
            if (!bike.alive) continue;

            for (const other of this.bikes) {
                const trail = other.trail;
                for (let i = 0; i < trail.length; i++) {
                    if (other === bike && i > trail.length - 10) continue;
                    if (dist2(bike, trail[i]) < COLLISION_RADIUS2) {
                        bike.alive = false;
                        break;
                    }
                }
                if (!bike.alive) break;
            }
        }

        for (let i = 0; i < this.bikes.length; i++) {
            const a = this.bikes[i];
            if (!a.alive) continue;
            for (let j = i + 1; j < this.bikes.length; j++) {
                const b = this.bikes[j];
                if (!b.alive) continue;
                if (dist2(a, b) < BIKE_BODY_RADIUS2 * 4) {
                    a.alive = false;
                    b.alive = false;
                }
            }
        }

        for (const bike of this.bikes) {
            if (!bike.alive) continue;

            for (const ob of this.obstacles) {
                if (ob.type === "wall") {
                    if (lineCollide(bike, ob.points[0], ob.points[1])) bike.alive = false;
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

        for (const bike of this.bikes) {
            if (!bike.alive) continue;
            for (const bonus of this.bonuses) {
                if (!bonus.alive) continue;
                if (dist2(bike, bonus) < COLLISION_RADIUS2 * 4) {
                    bonus.alive = false;
                }
            }
        }
    }
}

function lineCollide(b, a, c) {
    return pointSegmentDist2(b.x, b.y, a, c) < 160;
}

function polyHit(b, pts) {
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const c = pts[(i + 1) % pts.length];
        if (pointSegmentDist2(b.x, b.y, a, c) < 160) return true;
    }
    return false;
}

function pointSegmentDist2(px, py, a, c) {
    const vx = c.x - a.x;
    const vy = c.y - a.y;
    const ux = px - a.x;
    const uy = py - a.y;
    const t = Math.max(0, Math.min(1, (ux*vx + uy*vy)/(vx*vx + vy*vy)));
    const dx = a.x + vx*t - px;
    const dy = a.y + vy*t - py;
    return dx*dx + dy*dy;
}
