let game;
var body = null;

function refreshGameBody() {
    body = document.getElementById("main");
    return body;
}

function stopGame() {
    if (game) {
        window.clearInterval(game);
        game = null;
    }
    document.removeEventListener("keydown", keypress);
    document.removeEventListener("keyup", keyReleased);
}

function start(fps, gameLoop) {
    stopGame();
    refreshGameBody();
    if (!body) return;

    // Add key press event & start game
    document.addEventListener("keydown", keypress);
    document.addEventListener("keyup", keyReleased);
    game = setInterval(gameLoop, 1000 / fps); // 10FPS
}
const keys = [];
let width = 15, height = 15;

// Update grid size to a power of 2, since it helps render images better
function getGridSize() {
    const columns = Math.max(width + 1, 1);
    const rows = Math.max(height + 1, 1);
    const desired = Math.floor(
        Math.min(
            window.innerWidth / columns,
            window.innerHeight / rows
        )
    );

    return Math.max(desired, 4);
}
function setBodySize() {
    refreshGameBody();
    if (!body) return;

    // Update grid size
    gridSize = getGridSize();

    // Update body size
    body.style.width = (width+1) * gridSize + "px";
    body.style.height = (height+1) * gridSize + "px";

}
let gridSize = getGridSize();


function resetGame() {
    stopGame();

    // Pause for a quarter second to let the player know they died
    // Then send the player back to game room
    setTimeout(() => {
        if (typeof load === "function") {
            load("gameRoom");
        } else {
            history.back();
        }
    }, 250);
}
function keypress(e) {
    keys[e.key.toLowerCase()] = true;
}
function keyReleased(e) {
    keys[e.key.toLowerCase()] = false;
}
