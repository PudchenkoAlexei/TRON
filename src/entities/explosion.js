export default class Explosion {
    constructor(x, y, color) {
        this.particles = [];
        this.alive = true;

        for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 220;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.6 + Math.random() * 0.5,
                color
            });
        }
    }

    update(dt) {
        let alive = false;

        for (const p of this.particles) {
            p.life -= dt;
            if (p.life > 0) alive = true;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            p.vx *= 0.98;
            p.vy *= 0.98;
        }

        this.alive = alive;
    }
}
