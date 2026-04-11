const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

// 🔥 PLAYER MOVE FUNCTION
function movePlayer(x) {
  player.x = x - player.width / 2;

  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width;
  }
}

// 🖱️ mouse click (still works)
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  movePlayer(e.clientX - rect.left);
});

// 📱 TOUCH DRAG SYSTEM (NEW)
let isDragging = false;

// start
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isDragging = true;

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  movePlayer(touch.clientX - rect.left);
}, { passive: false });

// move
canvas.addEventListener("touchmove", (e) => {
  if (!isDragging) return;

  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  movePlayer(touch.clientX - rect.left);
}, { passive: false });

// end
canvas.addEventListener("touchend", () => {
  isDragging = false;
});

// 🔫 AUTO SHOOT
setInterval(() => {
  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10
  });
}, 300);

// 👾 SPAWN ENEMIES
setInterval(() => {
  enemies.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    width: 40,
    height: 20,
    shootTimer: 0
  });
}, 1000);

// 🔄 UPDATE
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
        break;
      }
    }
  }
}

// 🎨 DRAW
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
  bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // enemies
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // enemy bullets
  ctx.fillStyle = "orange";
  enemyBullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });
}

// 🔁 GAME LOOP
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

canvas.style.touchAction = "none";
