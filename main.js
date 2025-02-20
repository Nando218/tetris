const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const pauseBtn = document.getElementById("pauseButton");
const ScoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");

const ROWS = 20,
  COLS = 10,
  SIZE = 30;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

let isPaused = false;
let gameInterval;
let score = 0;
let highscore = localStorage.getItem("highscore") || 0;
highScoreElement.textContent = highScore;

const SHAPES = [
  [[1, 1, 1, 1]], //  Barra
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T
  [
    [1, 1, 1],
    [1, 0, 0],
  ], // L
  [
    [1, 1, 1],
    [0, 0, 1],
  ], // L invertida
  [
    [1, 1],
    [1, 1],
  ], // Cuadrado
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
];

let currentPiece = {
  shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  x: 3,
  y: 0,
};

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawBlock(x, y, "red");
      }
    });
  });
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
  ctx.strokeStyle = "black";
  ctx.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
}

function drawPiece() {
  currentPiece.shape.forEach((row, dy) =>
    row.forEach((value, dx) => {
      if (value) drawBlock(currentPiece.x + dx, currentPiece.y + dy, "red");
    })
  );
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
    currentPiece.shape.map((row) => row[i].reverse())
  );
  if (!collides(0, 0, rotated)) {
    gsap.to(currentPiece, {
      duration: 0.1,
      rotation: 360,
    });
    currentPiece.shape = rotated;
    draw();
  }
}

function mergePiece() {
  currentPiece.shape.forEach((row, dy) =>
    row.forEach((value, dx) => {
      if (value) board[currentPiece.y + dy][currentPiece.x + dx] = 1;
    })
  );
  fillLines();
  generatePiece();
}

function fillLines() {
  let lines = 0;
  board.forEach((row, y) => {
    if (row.every((cell) => cell)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      linesClear++;
    }
  });

  if (linesClear > 0) {
    let points =
      linesClear === 1
        ? 100
        : linesClear === 2
        ? 300
        : linesClear === 3
        ? 500
        : 800;
    updateScore(points);
  }
}

function updateScore(points) {
  score += points;
  scoreContainer.textContent = score;

  if (score > highscore) {
    highscore = score;
    highScoreElement.textContent = highscore;
    localStorage.setItem("highscore", highscore);
  }
}

function draw() {
  drawBoard();
  drawPiece();
}
