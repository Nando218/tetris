const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const pauseBtn = document.getElementById("pauseButton");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");

const ROWS = 20, COLS = 10, SIZE = 30;


let board = [];
for (let i = 0; i < ROWS; i++) {
    board.push(new Array(COLS).fill({ value: 0, color: null }));
}
let isPaused = false; 
let gameInterval;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; 
highScoreElement.textContent = highScore;

const SHAPES = [
    { shape: [[1, 1, 1, 1]], color: '#00f0f0' }, 
    { shape: [[1,1], [1,1]], color: '#f0f000' }, 
    { shape: [[0,1,0], [1,1,1]], color: '#a000f0' }, 
    { shape: [[1,1,0], [0,1,1]], color: '#f00000' }, 
    { shape: [[0,1,1], [1,1,0]], color: '#00f000' }, 
    { shape: [[1,0,0], [1,1,1]], color: '#f0a000' }, 
    { shape: [[0,0,1], [1,1,1]], color: '#0000f0' }, 
];

let currentPiece = null;
generatePiece();

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => row.forEach((cell, x) => {
        if (cell.value) drawBlock(x, y, cell.color);
    }));
}


function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
}

function drawPiece() {
    currentPiece.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) drawBlock(currentPiece.x + dx, currentPiece.y + dy, currentPiece.color);
    }))
}

function movePiece(dx, dy) {
    if (!collides(dx, dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        draw();
    }
}

function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) => 
        currentPiece.shape.map(row => row[i]).reverse());

    if (!collides(0, 0, rotated)) {
        gsap.to(currentPiece, { duration: 0.1, rotation: 360 });
        currentPiece.shape = rotated;
        draw();
    }
}

function mergePiece() {
    currentPiece.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) board[currentPiece.y + dy][currentPiece.x + dx] = { value: 1, color: currentPiece.color }
    }));
    fillLines();
    generatePiece();
}

function fillLines() {
    let linesClear = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell.value)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill({ value: 0, color: null }));
            linesClear++;
            y++;
        }
    }

    if (linesClear > 0) {
        let points = linesClear === 1 ? 100 : linesClear === 2 ? 300 : linesClear === 3 ? 500 : 800;
        updateScore(points);
    }
}

function updateScore(points) {
    score += points;
    scoreElement.textContent = score;

    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem("highScore", highScore);
    }
}

function generatePiece() {
    const randomPiece = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    currentPiece = { 
        shape: randomPiece.shape, 
        color: randomPiece.color,
        x: 3, 
        y: 0
    };
    if (collides()) {
        gameOver();
    }
}

function collides(dx = 0, dy = 0, newShape = null) {
    const shape = newShape || currentPiece.shape;
    return shape.some((row, dy2) => 
        row.some((value, dx2) => 
            value && 
            (currentPiece.x + dx + dx2 < 0 ||
            currentPiece.x + dx + dx2 >= COLS ||
            currentPiece.y + dy + dy2 >= ROWS ||
            board[currentPiece.y + dy + dy2]?.[currentPiece.x + dx + dx2].value !== 0)
        )
    );
}

function dropPiece() {
    if (!collides(0, 1)) {
        currentPiece.y += 1;
        draw();
    } else {
        mergePiece();
    }
}

function gameOver() {
    alert("game over! Tu puntuación fue: " + score);
    board = Array.from({ length: ROWS }, () => Array(COLS).fill({ value: 0, color: null }));
    score = 0;
    scoreElement.textContent = score;
    draw();
}


function draw() {
    drawBoard();
    drawPiece();
}

function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Reanudar" : "Pausar";
    if (isPaused) clearInterval(gameInterval);
    else gameInterval = setInterval(dropPiece, 500);
}

document.addEventListener("keydown", (e) => {
    if (!isPaused) {
        if (e.key === "ArrowLeft") movePiece(-1, 0);
        if (e.key === "ArrowRight") movePiece(1, 0);
        if (e.key === "ArrowDown") dropPiece();
        if (e.key === "ArrowUp") rotatePiece();
    }
});

pauseBtn.addEventListener("click", togglePause);

gameInterval = setInterval(dropPiece, 500);
draw();