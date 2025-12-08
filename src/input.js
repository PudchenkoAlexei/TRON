const inputState = {
    left: false,
    right: false,
    restartPressed: false
};

export function initInput() {
    window.addEventListener('keydown', e => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputState.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') inputState.right = true;
        if (e.code === 'KeyR') inputState.restartPressed = true;
    });

    window.addEventListener('keyup', e => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputState.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') inputState.right = false;
    });
}

export function consumeRestart() {
    const pressed = inputState.restartPressed;
    inputState.restartPressed = false;
    return pressed;
}

export function getInputState() {
    return inputState;
}
