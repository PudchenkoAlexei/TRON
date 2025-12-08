import World from './world.js';
import { initInput, getInputState, consumeRestart } from './input.js';
import { renderWorld } from './renderer.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

initInput();

const world = new World();
world.init();

let lastTs = performance.now();

function gameLoop(ts) {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    const inputState = getInputState();

    if (consumeRestart()) world.init();

    world.update(dt, inputState);
    renderWorld(world, ctx, canvas);

    statusEl.textContent = world.statusMessage;

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
