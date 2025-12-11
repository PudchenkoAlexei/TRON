import World from "./core/world.js";
import { initInput, getInputState, consumeRestart, consumeExitToMenu } from "./input/input.js";
import { renderWorld } from "./render/renderer.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const duelBtn = document.getElementById("duelBtn");
const ui = document.getElementById("ui");

const gameover = document.getElementById("gameover");
const goText = document.getElementById("goText");
const retryBtn = document.getElementById("retryBtn");
const menuBtn = document.getElementById("menuBtn");

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
    gameover.style.display = "none";
    gameStarted = true;
    world.init("normal");
});

duelBtn.addEventListener("click", () => {
    menu.style.display = "none";
    ui.style.display = "block";
    gameover.style.display = "none";
    gameStarted = true;
    world.init("duel");
});

function showMenu() {
    ui.style.display = "none";
    gameover.style.display = "none";
    menu.style.display = "flex";
    gameStarted = false;
}

function showGameOver(text) {
    goText.textContent = text;
    gameover.style.display = "flex";
}

retryBtn.addEventListener("click", () => {
    gameover.style.display = "none";
    world.init(world.mode);
});

menuBtn.addEventListener("click", () => {
    showMenu();
});

let lastTs = performance.now();

function gameLoop(ts) {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    if (gameStarted) {
        const inputState = getInputState();

        if (consumeExitToMenu()) {
            showMenu();
            return requestAnimationFrame(gameLoop);
        }

        if (consumeRestart() && world.gameOver) {
            gameover.style.display = "none";
            world.init(world.mode);
        }

        world.update(dt, inputState);
        renderWorld(world, ctx, canvas);
        statusEl.textContent = world.statusMessage;

        if (world.gameOver) {
            showGameOver(world.statusMessage);
        }
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
