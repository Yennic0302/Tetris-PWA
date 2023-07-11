if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/Tetris-PWA/worker.js")
    .then((reg) => console.log("service worker alredy instaled", reg))
    .catch((err) => console.error("error in register service worker", err));
}

const Shapes = [
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
  [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  [
    [1, 1],
    [1, 1],
  ],
];

const colors = [
  "#333",
  "#9b5fe0",
  "#16a4d8",
  "#60dbe8",
  "#8bd346",
  "#efdf48",
  "#f9a52c",
  "#d64e12",
];

const rows = 20;
const cols = 10;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let score = 0;
let record = localStorage.getItem("record") || 0;
let gameUpdate;
let pauseGame = false;

const scoreH2 = document.querySelector(".score");
const recordH2 = document.querySelector(".record");

scoreH2.textContent = "Score:" + score;
recordH2.textContent = "Record:" + record;

const btnPlay = document.getElementById("play-game");
const btnPlayAgain = document.getElementById("play-again");

btnPlay.addEventListener("click", () => {
  gameUpdate = setInterval(newGameState, 500);
  let mainScreen = document.querySelector(".main-screen");
  mainScreen.style.display = "none";
  let gameScreen = document.querySelector(".game-screen");
  gameScreen.style.display = "flex";
});

btnPlayAgain.addEventListener("click", () => {
  gameUpdate = setInterval(newGameState, 500);
  let gameOverContainer = document.querySelector(".game-over-screen");
  gameOverContainer.style.display = "none";
});

canvas.width = 300;
canvas.height = 600;
canvas.style.background = "#333";
ctx.scale(30, 30);

let pieceObj = null;
let grid = generateGrid();

function generateRandomPiece() {
  let ran = Math.floor(Math.random() * 7);
  let piece = Shapes[ran];
  let colorIndex = ran + 1;
  let x = 4;
  let y = 0;
  return { piece, x, y, colorIndex };
}

function newGameState() {
  checkGrid();
  if (!pieceObj) {
    pieceObj = generateRandomPiece();
    renderPiece();
  }
  moveDown();
}

function checkGrid() {
  for (let i = 0; i < grid.length; i++) {
    let allFilled = true;
    for (let e = 0; e < grid[i].length; e++) {
      if (grid[i][e] == 0) {
        allFilled = false;
      }
    }
    if (allFilled) {
      grid.splice(i, 1);
      grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      score += 100;
      scoreH2.textContent = "Score:" + score;
    }
  }
}

const pause = document.querySelector(".pause");
const reset = document.querySelector(".reset-game");

document.addEventListener("keydown", (e) => {
  if (e.code == "Space") {
    if (pause.style.display == "none") {
      gameUpdate = setInterval(newGameState, 500);
      pause.style.display = "block";
      reset.style.display = "none";
      pauseGame = false;
    } else {
      clearInterval(gameUpdate);
      pause.style.display = "none";
      reset.style.display = "block";
      pauseGame = true;
    }
  }
});

pause.addEventListener("click", () => {
  clearInterval(gameUpdate);
  pause.style.display = "none";
  reset.style.display = "block";
  pauseGame = true;
});

reset.addEventListener("click", () => {
  gameUpdate = setInterval(newGameState, 500);
  pause.style.display = "block";
  reset.style.display = "none";
  pauseGame = false;
});

function renderPiece() {
  let piece = pieceObj.piece;
  for (let i = 0; i < piece.length; i++) {
    for (let e = 0; e < piece.length; e++) {
      if (piece[i][e] == 1) {
        ctx.fillStyle = colors[pieceObj.colorIndex];
        ctx.fillRect(pieceObj.x + e, pieceObj.y + i, 1, 1);
      }
    }
  }
}

function moveDown() {
  if (colisions(pieceObj.x, pieceObj.y + 1, pieceObj.piece)) pieceObj.y += 1;
  else {
    endColisions();
    pieceObj = null;
  }
  renderGrid();
}
function generateGrid() {
  let grid = [];
  for (let i = 0; i < rows; i++) {
    grid.push([]);
    for (let e = 0; e < cols; e++) {
      grid[i].push(0);
    }
  }
  return grid;
}

function colisions(x, y, piece) {
  for (let i = 0; i < piece.length; i++) {
    for (let e = 0; e < piece[i].length; e++) {
      if (piece[i][e] == 1) {
        let p = x + e;
        let q = y + i;
        if (!(p >= 0 && p < cols && q >= 0 && q < rows)) {
          return false;
        } else {
          if (grid[q][p] > 0) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

function endColisions() {
  for (let i = 0; i < pieceObj.piece.length; i++) {
    for (let e = 0; e < pieceObj.piece[i].length; e++) {
      if (pieceObj.piece[i][e] == 1) {
        let p = pieceObj.x + e;
        let q = pieceObj.y + i;
        grid[q][p] = pieceObj.colorIndex;
      }
    }
  }

  if (pieceObj.y == 0) {
    if (score > record) {
      localStorage.setItem("record", score);
    }
    let gameOverContainer = document.querySelector(".game-over-screen");
    gameOverContainer.style.display = "flex";
    score = 0;
    record = localStorage.getItem("record");
    scoreH2.textContent = "Score:" + score;
    recordH2.textContent = "Record:" + record;
    grid = generateGrid();
    clearInterval(gameUpdate);
  }
}

function renderGrid() {
  for (let i = 0; i < grid.length; i++) {
    for (let e = 0; e < grid[i].length; e++) {
      ctx.fillStyle = colors[grid[i][e]];
      ctx.fillRect(e, i, 1, 1);
    }
  }
  renderPiece();
}

function moveRight() {
  if (colisions(pieceObj.x + 1, pieceObj.y, pieceObj.piece)) pieceObj.x += 1;

  renderGrid();
}

function moveLeft() {
  if (colisions(pieceObj.x - 1, pieceObj.y, pieceObj.piece)) pieceObj.x -= 1;

  renderGrid();
}
function rotate() {
  let rotatedPiece = [];
  let piece = pieceObj.piece;
  for (let i = 0; i < piece.length; i++) {
    rotatedPiece.push([]);
    for (let e = 0; e < piece[i].length; e++) {
      rotatedPiece[i].push(0);
    }
  }
  for (let i = 0; i < piece.length; i++) {
    for (let e = 0; e < piece[i].length; e++) {
      rotatedPiece[i][e] = piece[e][i];
    }
  }

  for (let i = 0; i < rotatedPiece.length; i++) {
    rotatedPiece[i] = rotatedPiece[i].reverse();
  }

  if (colisions(pieceObj.x, pieceObj.y, rotatedPiece)) {
    pieceObj.piece = rotatedPiece;
    renderGrid();
  }
}

document.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (!pauseGame) {
    if (e.key == "ArrowDown") {
      moveDown();
    }
    if (e.key == "ArrowRight") {
      moveRight();
    }
    if (e.key == "ArrowLeft") {
      moveLeft();
    }
    if (e.key == "ArrowUp") {
      rotate();
    }
  }
});

document.querySelector(".btnMobileLeft").addEventListener("mousedown", () => {
  if (!pauseGame) moveLeft();
});
document.querySelector(".btnMobileDown").addEventListener("mousedown", () => {
  if (!pauseGame) moveDown();
});
document.querySelector(".btnMobileRigth").addEventListener("mousedown", () => {
  if (!pauseGame) moveRight();
});
document.querySelector(".btnMobileRotate").addEventListener("mousedown", () => {
  if (!pauseGame) rotate();
});
