console.log("NEW CODE LOADED");
let isPaused = false;
let score = 0;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";
canvas.style.touchAction = "none";

// Player
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

// MOVE PLAYER
function movePlayer(x) {
  player.x = x - player.width / 2;

  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width;
  }
}

// PAUSE BUTTON HITBOX
function isInsidePauseButton(x, y) {
  return x >= 20 && x <= 70 && y >= 20 && y <= 70;
}

// CLICK
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (isInsidePauseButton(x, y)) {
    isPaused = !isPaused;
    return;
  }

  movePlayer(x);
});

// TOUCH START
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  const x = touch.clientX - rect.left;

  if (isInsidePauseButton(x, touch.clientY - rect.top)) {
    isPaused = !isPaused;
    isDragging = false;
    return;
  }

  isDragging = true;
  movePlayer(x);
}, { passive: false });

// TOUCH MOVE
canvas.addEventListener("touchmove", (e) => {
  if (!isDragging) return;

  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  movePlayer(touch.clientX - rect.left);
}, { passive: false });

// TOUCH END
canvas.addEventListener("touchend", () => {
  isDragging = false;
});

// AUTO SHOOT
setInterval(() => {
  if (isPaused) return;

  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10
  });
}, 300);

// SPAWN ENEMIES
setInterval(() => {
  if (isPaused) return;

  enemies.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    width: 40,
    height: 20,
    shootTimer: 0
  });
}, 1000);

// UPDATE
function update() {
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
    enemyBullets[i].y += 4;
    if (enemyBullets[i].y > canvas.height) enemyBullets.splice(i, 1);
  }

  // collision
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
        break;
      }
    }
  }
}

// DRAW
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  drawPauseButton();
  drawHUD();
}

// PAUSE BUTTON
function drawPauseButton() {
  ctx.fillStyle = "white";
  const size = 40;

  if (isPaused) {
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20, 20 + size);
    ctx.lineTo(20 + size, 20 + size / 2);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(20, 20, 10, size);
    ctx.fillRect(35, 20, 10, size);
  }
}

// HUD (score + crosshair)
function drawHUD() {
  const margin = 20;
  const x = canvas.width - margin - 40;
  const y = 50;

  // 🎯 aim sign
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x, y + 20);
  ctx.stroke();

  // 🔢 score
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  ctx.fillText(String(score), x + 30, y);
}

// LOOP
function gameLoop() {
  if (!isPaused) {
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
