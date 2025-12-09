import World from "./core/world.js";
import { initInput, getInputState, consumeRestart } from "./input/input.js";
import { renderWorld } from "./render/renderer.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const duelBtn = document.getElementById("duelBtn");
const ui = document.getElementById("ui");

let gameStarted = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

initInput();

const world = new World();

startBtn.addEventListener("click", () => {
    menu.style.display = "none";
    ui.style.display = "block";
    gameStarted = true;
    world.init("normal");
});

duelBtn.addEventListener("click", () => {
    menu.style.display = "none";
    ui.style.display = "block";
    gameStarted = true;
    world.init("duel");
});

let lastTs = performance.now();

function gameLoop(ts) {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    if (gameStarted) {
        const inputState = getInputState();
        if (consumeRestart()) world.init(world.mode);
        world.update(dt, inputState);
        renderWorld(world, ctx, canvas);
        statusEl.textContent = world.statusMessage;
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
