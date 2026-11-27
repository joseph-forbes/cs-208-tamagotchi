import { body, game, gridSize, height, keys, refreshGameBody, resetGame, setBodySize, setHeight, setWidth, start, stopGame, width } from "./games-global.ts";
import { gameGoobert } from "../components/game-room.tsx";
import { gameOverSound, snakeEatingSound } from "../components/audio.ts";
import "./snake-stylesheet.css";
import recolorSpriteSheet from "./recolor.js";

// Callback used to restore Cleanliness through React context.
let fullnessReward = null;

// Allow the React component to register its reward function.
export function setFullnessReward(callback) {
    fullnessReward = callback;
}

const img = new Image();
img.src = "../images/games/snake.png";
const heads = new Image();
heads.src = "../images/goobert-parts/208-tamagotchi-bodies.png";
const newImg = document.createElement('canvas');

let eyes;
function initEyes() {
    eyes = document.createElement("div");
    eyes.classList.add("eyes");
    
    eyes.style.width = gridSize + "px";
    eyes.style.height = gridSize + "px";

    const scale = gridSize / 64;
    eyes.style.backgroundSize = 
        scale * assets.size * assets.eyeExpressions + "px " + 
        scale * assets.size * assets.totalEyes + "px";
    const goobertEyes = {
        type: gameGoobert ? gameGoobert.eyeType * gridSize : gridSize * 2,
        expression: gameGoobert ? gameGoobert.eyeExpression * gridSize : 0
    }
    eyes.style.backgroundPosition = `-${goobertEyes.expression}px -${goobertEyes.type}px`;

    if(gameGoobert) {
        const mouth = document.createElement("div");
        mouth.style.backgroundSize = 
            scale * assets.size * assets.mouthExpressions + "px " + 
            scale * assets.size * assets.totalMouths + "px";
        console.log(gameGoobert.mouthExpression);
        const goobertMouth = {
            type: gameGoobert.mouthType * gridSize,
            // expression: 0
            expression: gameGoobert.mouthExpression * gridSize
        }
        mouth.style.backgroundPosition = `-${goobertMouth.expression}px -${goobertMouth.type}px`;

        mouth.classList.add("mouth");
        mouth.style.width = gridSize + "px";
        mouth.style.height = gridSize + "px";
        eyes.appendChild(mouth);
    }
}

const hues = [];
let hue;

img.onload = () => {
    // Update head
    newImg.width = img.width;
    newImg.height = img.height;
    const ctx = newImg.getContext('2d');
    ctx.drawImage(img, 0, 0, assets.size * 4, assets.size * 4, 0, 0, assets.size * 4, assets.size * 4);

    const headPos = gameGoobert ? gameGoobert.bodyType : 2
    for(let i = 0; i < 4; i++) {
        ctx.drawImage(
            heads, 
            0, headPos * assets.size, assets.size, assets.size, 
            assets.head * assets.size, i * assets.size, assets.size, assets.size
        )
    }

    hues.push(recolorSpriteSheet(newImg, 0));
    hues.push(recolorSpriteSheet(newImg, 30));
    hues.push(recolorSpriteSheet(newImg, 60));
    hues.push(recolorSpriteSheet(newImg, 120));
    hues.push(recolorSpriteSheet(newImg, 210));
    hues.push(recolorSpriteSheet(newImg, 240));
    hues.push(recolorSpriteSheet(newImg, 270));

    hue = gameGoobert ? hues[gameGoobert.bodyColor] : hues[0];
}
const initializeHues = () => {
    const ctx = newImg.getContext('2d');
    ctx.clearRect(assets.head * assets.size, 0, assets.size, newImg.height);
    const headPos = gameGoobert ? gameGoobert.bodyType : 2
    for(let i = 0; i < 4; i++) {
        ctx.drawImage(
            heads, 
            0, headPos * assets.size, assets.size, assets.size, 
            assets.head * assets.size, i * assets.size, assets.size, assets.size
        )
    }

    hues[0] = (recolorSpriteSheet(newImg, 0));
    hues[1] = (recolorSpriteSheet(newImg, 30));
    hues[2] = (recolorSpriteSheet(newImg, 60));
    hues[3] = (recolorSpriteSheet(newImg, 120));
    hues[4] = (recolorSpriteSheet(newImg, 210));
    hues[5] = (recolorSpriteSheet(newImg, 240));
    hues[6] = (recolorSpriteSheet(newImg, 270));
}

export function initSnakeGame(boardWidth, boardHeight) {
    if (typeof stopGame === "function") {
        stopGame();
    }
    if (typeof refreshGameBody === "function") {
        refreshGameBody();
    }
    if (!body) return;

    initializeHues();

    setWidth(Math.max(6, parseInt(boardWidth, 10) || 15) - 1);
    setHeight(Math.max(6, parseInt(boardHeight, 10) || 15) - 1);
    setBodySize();

    body.innerHTML = "";
    snakeDivs.innerHTML = "";
    snakeDivs.id = "snakeDivs";
    body.appendChild(snakeDivs);

    initEyes();
    snakeDivs.appendChild(eyes);

    hue = gameGoobert ? hues[gameGoobert.bodyColor] : hues[0];
    snake = createInitialSnake();
    apple = createInitialApple();

    for (let position of snake.positions) {
        position.asset = [assets.right, assets.right];
        position.div = createSnakeDiv(position.x, position.y, position.id, position.asset);
        updateImage(position);
    }

    snake.head = snake.positions[0];
    snake.head.asset[1] = assets.head;
    updateImage(snake.head);

    createAppleDiv();
    apple.div = document.getElementById("apple");
    setPosition(apple.div, apple.x, apple.y);

    start(10, gameloop);
}

const assets = {
    left: 0,
    down: 1,
    right: 2,
    up: 3,
    head: 4,

    size: 64, // Asset size in pixels
    eyeExpressions: 7,
    mouthExpressions: 6,
    totalEyes: 10,
    totalMouths: 11
}
const snakeDivs = document.createElement("div");
let snake = null;
let apple = null;

function createInitialSnake() {
    const startY = Math.floor(height / 2);
    return {
        positions: [
            { x: width > 10 ? 6 : 3, y: startY, id: 0 },
            { x: width > 10 ? 5 : 2, y: startY, id: 1 },
            { x: width > 10 ? 4 : 1, y: startY, id: 2 }
        ],
        velocity: {
            y: 0,
            x: 1,
            direction: assets.right
        },
        head: { x: width > 10 ? 6 : 3, y: startY, id: 0 },
        direction: assets.right
    };
}

function createInitialApple() {
    return {
        x: width > 15 ? width - 8 : width - 3,
        y: Math.floor(height / 2)
    };
}

function gameloop() {
    handleKeyPress();
    moveSnake();
}

function moveSnake() {
    // change snake direction if key was pressed this frame
    snake.direction = snake.velocity.direction;

    // Update snake head based on current head
    let currentSquare = snake.head;
    snake.head = snake.positions[snake.positions.length - 1];

    currentSquare.asset[1] = snake.direction;
    updateImage(currentSquare);
    setObjPosition(currentSquare);

    // Update head x
    snake.head.x = currentSquare.x + snake.velocity.x;
    if (snake.head.x > width) {
        snake.head.x = 0;
    } else if (snake.head.x < 0) {
        snake.head.x = width;
    }

    // Update head y
    snake.head.y = currentSquare.y + snake.velocity.y;
    if (snake.head.y > height) {
        snake.head.y = 0;
    } else if (snake.head.y < 0) {
        snake.head.y = height;
    }

    // Eat apple if the snake head would end up on the apple this frame
    // This is an easy way to ensure when the snake grows, it will not grow into itself
    if (snake.head.x == apple.x && snake.head.y == apple.y) {
        eatApple();
    } else {
        // Move snake forward if it has not eaten an apple this frame
    
        snake.positions.splice(snake.positions.length - 1);
        snake.positions.unshift(snake.head);
        setObjPosition(snake.head);
    
        for (let position of snake.positions) {
            // Kill snake if it is touching itself
            if (position.x == snake.head.x && position.y == snake.head.y && position != snake.head) {
                
                // Play the game-over sound.
                gameOverSound.play();

                // Reset the game.
                resetGame();
                return;
            }
        }

        // Update assets
        snake.head.asset[0] = snake.direction;
        snake.head.asset[1] = assets.head;
        updateImage(snake.head);
    }
}
function createSnakeDiv(x, y, id, asset) {
    let canvas = document.createElement("canvas");
    canvas.width = gridSize;
    canvas.height = gridSize;
    let ctx = canvas.getContext("2d");

    ctx.drawImage(hue, 0, 0, assets.size * 5, assets.size * 4);

    setPosition(canvas, x, y);
    canvas.id = id;
    canvas.classList.add("snake");
    canvas.style.width = gridSize + "px";
    canvas.style.height = gridSize + "px";

    snakeDivs.appendChild(canvas);

    return canvas;
}
function updateImage(cell) {
    let sx = cell.asset[1] * assets.size;
    let sy = cell.asset[0] * assets.size;

    let ctx = cell.div.getContext("2d");
    ctx.clearRect(0,0,cell.div.width, cell.div.height);
    ctx.drawImage(hue, sx, sy, assets.size, assets.size, 0, 0, gridSize, gridSize);
}
function createAppleDiv(x, y) {
    let cell = document.createElement("div");
    cell.id = "apple";
    cell.classList.add("apple");
    cell.style.width = gridSize + "px";
    cell.style.height = gridSize + "px";

    cell.style.backgroundSize = 
        gridSize + "px " + 
        gridSize + "px";
    cell.style.backgroundPosition = "0 0";

    body.appendChild(cell);
}
function setPosition(div, x, y) {
    
    div.style.left = x * gridSize + "px";
    div.style.top = y * gridSize + "px";
}
function setObjPosition(obj) {
    if(obj == snake.head) {
        let xOffset = 0;
        if(snake.direction == assets.right) xOffset = - 1/4;
        if(snake.direction == assets.left) xOffset = 1/4;
        let yOffset = 1 / 8;
        if(snake.direction == assets.up) yOffset = - 1/4;
        if(snake.direction == assets.down) yOffset = 1/4;

        setPosition(obj.div, obj.x + (xOffset), obj.y + yOffset);
        obj.div.style.transform = "scale(1.2)";

        yOffset = 0;
        if(snake.direction == assets.up) yOffset = 1/4;
        if(snake.direction == assets.down) yOffset = -1/4;
        eyes.style.left = (obj.x - xOffset * 1.5) * gridSize + "px";
        eyes.style.top = (obj.y + yOffset * 1.5) * gridSize + "px";
    } else {
        setPosition(obj.div, obj.x, obj.y);
        obj.div.style.transform = "scale(1)";
    }
}
function eatApple() {
    // Play the eating sound when Snake collects apple
    snakeEatingSound.play();
    
    let newSquare = { x: apple.x, y: apple.y, id: snake.positions.length };
    newSquare.asset = [snake.direction, assets.head];

    newSquare.div = createSnakeDiv(apple.x, apple.y, snake.positions.length);
    snake.positions.unshift(newSquare);

    let validSpaces = findValidSpaces();
    let space = validSpaces[Math.floor(Math.random() * validSpaces.length)];

    apple.x = Math.floor(space.x);
    apple.y = Math.floor(space.y);
    setObjPosition(apple);

    const prevHead = snake.head;
    snake.head = newSquare;
    setObjPosition(prevHead);
    setObjPosition(newSquare);
    updateImage(newSquare);

    if(gameGoobert) {
        gameGoobert.fullness = Math.min(gameGoobert.fullness + 5, 100); // feed goobert
        // Update slider position
        document.getElementById('goobert-percentage').value = gameGoobert.fullness;
        fullnessReward(5);
    }
}
function findValidSpaces() {
    // As much as I hate nested loops, this is the best way I could think to do this.
    // This shouldn't scale too poorly with larger grids or snakes because the vast 
    // majority of players will have less than 30x30 (900) total tiles in the grid
    // meaning with a full grid and a maximally long snake, this will only run around 1800 times
    // which computers can do just fine
    let validSpaces = [];
    for(let x = 0; x < width; x++) {
        for(let y = 0; y < height; y++) {
            let isValid = true;
            for(let position of snake.positions) {
                if(position.x == x && position.y == y) {
                    isValid = false;
                    break;
                }
            }
            if(isValid) {
                validSpaces.push({x: x, y: y});
            }
        }
    }
    return validSpaces;
}

function handleKeyPress() {
    if (keys["a"] || keys["arrowleft"]) {
        setSnakeVelocity("left");
    } else if (keys["d"] || keys["arrowright"]) {
        setSnakeVelocity("right");
    }
    if (keys["s"] || keys["arrowdown"]) {
        setSnakeVelocity("down");
    } else if (keys["w"] || keys["arrowup"]) {
        setSnakeVelocity("up");
    }
}

export function setSnakeVelocity(dir) {
    switch (dir) {
        case "left":
            if(snake.direction != assets.right) {
                snake.velocity = { x: -1, y: 0, direction: assets.left };
            }
            break;
        case "down":
            if(snake.direction != assets.down) {
                snake.velocity = { x: 0, y: 1, direction: assets.up };
            }
        break;
        case "right":
            if(snake.direction != assets.left) {
                snake.velocity = { x: 1, y: 0, direction: assets.right };
            }
        break;
        case "up":
            if(snake.direction != assets.up) {
                snake.velocity = { x: 0, y: -1, direction: assets.down };
            }
    }
}