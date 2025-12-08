import Bike from './bike.js';
import { updateBotAI } from './ai.js';
import {
    WORLD_SIZE,
    COLLISION_RADIUS,
    BONUS_TYPES,
    BONUS_LIFETIME,
    BONUS_SPAWN_INTERVAL
} from './config.js';
import { dist2 } from './util.js';

const COLLISION_RADIUS2 = COLLISION_RADIUS * COLLISION_RADIUS;

function createBonus(x, y, type) {
    return {
        x,
        y,
        type,
        alive: true,
        timeLeft: BONUS_LIFETIME
    };
}

export default class World {
    constructor() {
        this.bikes = [];
        this.player = null;
        this.gameOver = false;
        this.winner = null;
        this.bonuses = [];
        this._bonusSpawnTimer = BONUS_SPAWN_INTERVAL;
        this.statusMessage = '';
    }

    init() {
        this.bikes = [];
        this.bonuses = [];
        this.gameOver = false;
        this.winner = null;
        this._bonusSpawnTimer = BONUS_SPAWN_INTERVAL;

        this.player = new Bike(0, 0, 0, '#00ffff', { isPlayer: true });
        this.player.resetTrail();
        this.bikes.push(this.player);

        const bot = new Bike(200, 0, Math.PI, '#ff00ff', { type: 'aggressive' });
        bot.resetTrail();
        this.bikes.push(bot);

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
                    const p = trail[i];
                    if (other === bike && i > trail.length - 10) continue;
                    if (dist2(bike, p) < COLLISION_RADIUS2) {
                        bike.alive = false;
                        break;
                    }
                }
                if (!bike.alive) break;
            }
        }

        for (const bike of this.bikes) {
            if (!bike.alive) continue;
            for (const bonus of this.bonuses) {
                if (!bonus.alive) continue;
                if (dist2(bike, bonus) < COLLISION_RADIUS2 * 4) {
                    this.applyBonus(bike, bonus);
                    bonus.alive = false;
                }
            }
        }
    }

    applyBonus(bike, bonus) {}
}
