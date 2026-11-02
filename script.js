// Get HTML elements
const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");

const messageScreen = document.getElementById("message-screen");
const messageTitle = document.getElementById("message-title");
const messageText = document.getElementById("message-text");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");
const pauseButton = document.getElementById("pause-btn");

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Snake and food
let snake = [];
let food = { x: 15, y: 10 };

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let score = 0;
let bestScore = Number(localStorage.getItem("snakeBestScore")) || 0;

let gameLoop = null;
let gameRunning = false;
let isPaused = false;

// Display best score
bestScoreElement.textContent = bestScore;

// Start or restart game
function startGame() {
    clearInterval(gameLoop);

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    scoreElement.textContent = score;

    isPaused = false;
    gameRunning = true;

    pauseButton.textContent = "Pause Game";
    startButton.textContent = "Start Game";

    createFood();

    messageScreen.style.display = "none";

    drawGame();

    gameLoop = setInterval(updateGame, 120);
}

// Create food
function createFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(segment =>
            segment.x === food.x &&
            segment.y === food.y
        )
    );
}

// Update game
function updateGame() {
    if (!gameRunning || isPaused) return;

    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    const eatingFood =
        head.x === food.x && head.y === food.y;

    // Wall collision
    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {
        endGame();
        return;
    }

    // Self collision
    const bodyToCheck = eatingFood
        ? snake
        : snake.slice(0, -1);

    const hitSelf = bodyToCheck.some(segment =>
        segment.x === head.x &&
        segment.y === head.y
    );

    if (hitSelf) {
        endGame();
        return;
    }

    // Move snake
    snake.unshift(head);

    if (eatingFood) {
        score += 10;
        scoreElement.textContent = score;

        // Update best score
        if (score > bestScore) {
            bestScore = score;

            bestScoreElement.textContent = bestScore;

            localStorage.setItem(
                "snakeBestScore",
                bestScore
            );
        }

        createFood();
    } else {
        snake.pop();
    }

    drawGame();
}

// Draw game
function drawGame() {

    // Clear board
    ctx.fillStyle = "#101c19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#1c3028";
    ctx.lineWidth = 1;

    for (let i = 0; i <= tileCount; i++) {

        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = "#ff5555";

    ctx.beginPath();

    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {

        const x = segment.x * gridSize + gridSize / 2;
        const y = segment.y * gridSize + gridSize / 2;

        ctx.fillStyle = index === 0
            ? "#a4ff78"
            : "#52cf68";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            gridSize / 2 - 1,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    // Draw snake eyes
    const head = snake[0];

    ctx.fillStyle = "#102018";

    ctx.beginPath();

    ctx.arc(
        head.x * gridSize + 7,
        head.y * gridSize + 6,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        head.x * gridSize + 14,
        head.y * gridSize + 6,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

// Change direction
function changeDirection(newDirection) {

    if (!gameRunning || isPaused) return;

    // Prevent reverse direction
    if (
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y
    ) {
        return;
    }

    nextDirection = newDirection;
}

// Keyboard controls
document.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    const controls = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },

        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },

        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },

        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 }
    };

    if (controls[key]) {
        event.preventDefault();
        changeDirection(controls[key]);
    }
});

// Mobile controls
document.querySelectorAll(".control-btn").forEach(button => {

    button.addEventListener("click", function() {

        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        const selectedDirection =
            directions[this.dataset.direction];

        if (selectedDirection) {
            changeDirection(selectedDirection);
        }
    });
});

// Pause and resume
pauseButton.addEventListener("click", function() {

    if (!gameRunning) return;

    if (!isPaused) {

        clearInterval(gameLoop);

        isPaused = true;
        pauseButton.textContent = "Resume Game";

    } else {

        isPaused = false;

        pauseButton.textContent = "Pause Game";

        gameLoop = setInterval(updateGame, 120);
    }
});

// End game
function endGame() {

    gameRunning = false;
    isPaused = false;

    clearInterval(gameLoop);

    messageTitle.textContent = "Game Over!";

    messageText.textContent =
        "Your final score: " + score;

    startButton.textContent = "Play Again";

    pauseButton.textContent = "Pause Game";

    messageScreen.style.display = "flex";
}

// Start button
startButton.addEventListener("click", startGame);

// Restart button
restartButton.addEventListener("click", startGame);

// Draw initial board
snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];

food = { x: 15, y: 10 };

drawGame();