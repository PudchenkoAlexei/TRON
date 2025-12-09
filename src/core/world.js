// core/world.js
import Bike from "../entities/bike.js";
import { updateBotAI } from "../entities/bots.js";
import { MAX_BOTS, WORLD_SIZE } from "./config.js";
import { randomObstacles } from "../systems/obstacles.js";
import { checkCollisions } from "../systems/collisions.js";

export default class World {
    constructor() {
        this.bikes = [];
        this.player = null;
        this.obstacles = [];
        this.bonuses = [];
        this.gameOver = false;
        this.statusMessage = "";
    }

    init() {
        this.bikes = [];
        this.bonuses = [];
        this.gameOver = false;

        this.spawnBikes();

        this.obstacles = randomObstacles(this);

        this.addBorderWalls();

        this.statusMessage = "Гра йде...";
    }

    addBorderWalls() {
        const S = WORLD_SIZE / 2;

        this.obstacles.push({
            type: "wall",
            points: [{ x: -S, y: -S }, { x: S, y: -S }]
        });
        this.obstacles.push({
            type: "wall",
            points: [{ x: S, y: -S }, { x: S, y: S }]
        });
        this.obstacles.push({
            type: "wall",
            points: [{ x: S, y: S }, { x: -S, y: S }]
        });
        this.obstacles.push({
            type: "wall",
            points: [{ x: -S, y: S }, { x: -S, y: -S }]
        });
    }

    spawnBikes() {
        const total = MAX_BOTS + 1;
        const r = WORLD_SIZE / 4;
        const step = (Math.PI * 2) / total;

        for (let i = 0; i < total; i++) {
            const ang = i * step;
            const x = Math.cos(ang) * r;
            const y = Math.sin(ang) * r;
            const dir = Math.atan2(-y, -x);

            if (i === 0) {
                this.player = new Bike(x, y, dir, "#00ffff", { isPlayer: true });
                this.player.resetTrail();
                this.bikes.push(this.player);
            } else {
                const bot = new Bike(x, y, dir, "#ff00ff", { type: "aggressive" });
                bot.resetTrail();
                this.bikes.push(bot);
            }
        }
    }

    update(dt, input) {
        if (this.gameOver) return;

        for (const b of this.bikes)
            if (!b.isPlayer) updateBotAI(b, this, dt);

        for (const b of this.bikes)
            b.update(dt, b.isPlayer ? input : null);

        checkCollisions(this);

        const alive = this.bikes.filter(b => b.alive);
        if (alive.length <= 1) {
            this.gameOver = true;
            this.statusMessage = this.player.alive
                ? "Ти переміг! 🎉 (R)"
                : "Ти програв 😢 (R)";
        }
    }
}
