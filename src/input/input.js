const inputState = {
    left: false,
    right: false,
    restartPressed: false,

    p2_left: false,
    p2_right: false,

    exitToMenuPressed: false,
};

export function initInput() {
    window.addEventListener("keydown", e => {
        if (e.code === "ArrowLeft") inputState.left = true;
        if (e.code === "ArrowRight") inputState.right = true;

        if (e.code === "KeyR") inputState.restartPressed = true;

        if (e.code === "KeyA") inputState.p2_left = true;
        if (e.code === "KeyD") inputState.p2_right = true;

        if (e.code === "Escape") inputState.exitToMenuPressed = true;
    });

    window.addEventListener("keyup", e => {
        if (e.code === "ArrowLeft") inputState.left = false;
        if (e.code === "ArrowRight") inputState.right = false;

        if (e.code === "KeyA") inputState.p2_left = false;
        if (e.code === "KeyD") inputState.p2_right = false;
    });
}

export function consumeRestart() {
    const pressed = inputState.restartPressed;
    inputState.restartPressed = false;
    return pressed;
}

export function consumeExitToMenu() {
    const pressed = inputState.exitToMenuPressed;
    inputState.exitToMenuPressed = false;
    return pressed;
}

export function getInputState() {
    return inputState;
}
