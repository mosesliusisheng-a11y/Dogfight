console.log("UPDATED VERSION LOADED");

let isPaused = false;
let score = 0;
let maxScore = 200;
let isGameOver = false;
let hasStarted = false;

// ❤️ HEALTH SYSTEM
let playerHealth = 10;
const maxHealth = 10;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 🎮 PLAYER
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  width: 50,
  height: 30
};

let bullets = [];
let enemyBullets = [];
let enemies = [];
let isDragging = false;

let shootInterval = null;
let enemyInterval = null;

// ⏸️ PAUSE (press P)
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") {
    isPaused = !isPaused;
  }
});

// 🎯 MOVE PLAYER
function movePlayer(x) {
  player.x = x - player.width / 2;

  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width;
  }
}

// 🚀 START GAME
function startGame() {
  if (hasStarted) return;
  hasStarted = true;

  shootInterval = setInterval(() => {
    if (isPaused || isGameOver) return;

    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10
    });
  }, 300);

  enemyInterval = setInterval(() => {
    if (isPaused || isGameOver) return;

    enemies.push({
      x: Math.random() * (canvas.width - 40),
      y: -40,
      width: 40,
      height: 20,
      shootTimer: 0
    });
  }, 1000);
}

// 🖱️ CLICK
canvas.addEventListener("click", (e) => {
  if (isGameOver) {
    location.reload();
    return;
  }

  if (!hasStarted) {
    startGame();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  movePlayer(e.clientX - rect.left);
});

// 📱 TOUCH
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();

  if (isGameOver) {
    location.reload();
    return;
  }

  if (!hasStarted) {
    startGame();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];

  isDragging = true;
  movePlayer(t.clientX - rect.left);
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  if (!isDragging) return;

  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];

  movePlayer(t.clientX - rect.left);
}, { passive: false });

canvas.addEventListener("touchend", () => {
  isDragging = false;
});

// 🔁 UPDATE GAME
function update() {
  if (!hasStarted || isGameOver || isPaused) return;

  // bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= 8;
    if (bullets[i].y < 0) bullets.splice(i, 1);
  }

  // enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.y += 2;

    e.shootTimer++;
    if (e.shootTimer > 60) {
      enemyBullets.push({
        x: e.x + e.width / 2,
        y: e.y,
        width: 4,
        height: 10
      });
      e.shootTimer = 0;
    }

    if (e.y > canvas.height) enemies.splice(i, 1);
  }

  // enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let b = enemyBullets[i];
    b.y += 4;

    if (b.y > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }

    if (
      b.x < player.x + player.width &&
      b.x + b.width > player.x &&
      b.y < player.y + player.height &&
      b.y + b.height > player.y
    ) {
      enemyBullets.splice(i, 1);
      playerHealth--;

      if (playerHealth <= 0) {
        playerHealth = 0;
        isGameOver = true;
      }
    }
  }

  // collisions
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      let b = bullets[bi];
      let e = enemies[ei];

      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);

        score++;

        if (score >= maxScore) {
          isGameOver = true;
        }

        break;
      }
    }
  }
}

// 🎨 DRAW
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!hasStarted) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TAP TO START", canvas.width / 2, canvas.height / 2);
    return;
  }

  // player
  ctx.fillStyle = "cyan";
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // bullets
  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  // enemies
  ctx.fillStyle = "red";
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));

  // enemy bullets
  ctx.fillStyle = "orange";
  enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  drawHUD();

  if (isPaused) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
  }

  if (isGameOver) {
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  }
}

// 🎯 CROSSHAIR (score)
function drawCross(x, y, size = 8) {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.moveTo(x - size - 5, y);
  ctx.lineTo(x + size + 5, y);
  ctx.moveTo(x, y - size - 5);
  ctx.lineTo(x, y + size + 5);
  ctx.stroke();
}

// ❤️ HEART (health)
function drawHeart(x, y, size = 12) {
  ctx.fillStyle = "white";

  ctx.beginPath();
  ctx.moveTo(x, y);

  ctx.arc(x - size / 2, y, size / 2, 0, Math.PI, true);
  ctx.arc(x + size / 2, y, size / 2, 0, Math.PI, true);

  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fill();
}

// 🧠 HUD
function drawHUD() {
  const baseX = canvas.width - 140;
  const baseY = 60;

  const iconX = baseX;
  const textX = baseX + 40;

  const healthY = baseY;
  const scoreY = baseY + 45;

  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // ❤️ HEALTH
  drawHeart(iconX + 10, healthY - 8, 12);
  ctx.font = "22px Arial";
  ctx.fillText(`${playerHealth}/${maxHealth}`, textX, healthY);

  // 🎯 SCORE
  drawCross(iconX, scoreY, 8);
  ctx.fillText(score, textX, scoreY);
}

// 🔁 LOOP
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
