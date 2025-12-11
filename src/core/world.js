import Bike from "../entities/bike.js";
import { updateBotAI } from "../entities/bots.js";
import { MAX_BOTS, WORLD_SIZE } from "./config.js";
import { randomObstacles } from "../systems/obstacles.js";
import { checkCollisions } from "../systems/collisions.js";
import { spawnInitialBonuses, updateBonuses } from "../systems/bonuses.js";
import Explosion from "../entities/explosion.js";

export default class World {
    constructor() {
        this.bikes = [];
        this.player = null;
        this.player2 = null;
        this.obstacles = [];
        this.bonuses = [];
        this.explosions = [];
        this.gameOver = false;
        this.statusMessage = "";
        this.mode = "normal";
    }

    init(mode = "normal") {
        this.mode = mode;

        this.bikes = [];
        this.bonuses = [];
        this.explosions = [];
        this.gameOver = false;

        if (mode === "duel") this.spawnTwoPlayers();
        else this.spawnBikes();

        this.obstacles = randomObstacles(this);
        this.addBorderWalls();
        spawnInitialBonuses(this);

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

    spawnTwoPlayers() {
        const r = WORLD_SIZE / 5;

        this.player = new Bike(-r, 0, 0, "#00ffff", { isPlayer: true });
        this.player.resetTrail();

        this.player2 = new Bike(r, 0, Math.PI, "#ff00ff", { isPlayer2: true });
        this.player2.resetTrail();

        this.bikes.push(this.player, this.player2);
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

        if (this.mode === "normal") {
            for (const b of this.bikes)
                if (!b.isPlayer) updateBotAI(b, this, dt);
        }

        for (const b of this.bikes) {
            if (b === this.player) {
                b.update(dt, { left: input.left, right: input.right });
            } 
            else if (b === this.player2) {
                b.update(dt, { left: input.p2_left, right: input.p2_right });
            } 
            else {
                b.update(dt, null);
            }
        }

        if (this.mode === "normal") {
            if (this.player && !this.player.alive) {
                this.gameOver = true;
                this.statusMessage = "Ти програв 😢";
                return;
            }
        }

        updateBonuses(this, dt);
        checkCollisions(this);

        for (const b of this.bikes) {
            if (!b.alive && !b.exploded) {
                b.exploded = true;
                this.explosions.push(new Explosion(b.x, b.y, b.color));
            }
        }

        for (const ex of this.explosions) ex.update(dt);
        this.explosions = this.explosions.filter(e => e.alive);

        const alive = this.bikes.filter(b => b.alive);

        if (alive.length <= 1) {
            this.gameOver = true;

            if (this.mode === "duel") {
                if (this.player.alive && !this.player2.alive)
                    this.statusMessage = "Гравець 1 переміг! (R)";
                else if (this.player2.alive && !this.player.alive)
                    this.statusMessage = "Гравець 2 переміг! (R)";
                else
                    this.statusMessage = "Нічия! (R)";
            } else {
                this.statusMessage = this.player.alive
                    ? "Ти переміг! 🎉 (R)"
                    : "Ти програв 😢 (R)";
            }
        }
    }
}
