const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE_SIZE = 16;

// Peta grid sederhana (0 = rumput, 1 = tanah garapan)
const cols = Math.floor(canvas.width / TILE_SIZE);
const rows = Math.floor(canvas.height / TILE_SIZE);
const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

const player = {
  x: 152,
  y: 82,
  width: 16,
  height: 16,
  speed: 1.5,
  targetX: null,
  targetY: null,
  color: "#ffeaa7"
};

// Ubah koordinat sentuhan layar ke koordinat internal canvas (320x180)
function getCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  const pos = getCanvasCoords(e.clientX, e.clientY);

  // Pusatkan tujuan ke tengah ukuran karakter
  player.targetX = pos.x - player.width / 2;
  player.targetY = pos.y - player.height / 2;
});

function update() {
  if (player.targetX !== null && player.targetY !== null) {
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= player.speed) {
      player.x = player.targetX;
      player.y = player.targetY;
      player.targetX = null;
      player.targetY = null;
    } else {
      player.x += (dx / distance) * player.speed;
      player.y += (dy / distance) * player.speed;
    }
  }
}

function drawGrid() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileX = c * TILE_SIZE;
      const tileY = r * TILE_SIZE;

      ctx.fillStyle = grid[r][c] === 1 ? "#b87a3d" : "#4ea853";
      ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

      // Garis grid tipis untuk membantu melihat petak saat prototipe
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
    }
  }
}

function drawTarget() {
  if (player.targetX !== null && player.targetY !== null) {
    const centerX = player.targetX + player.width / 2;
    const centerY = player.targetY + player.height / 2;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawTarget();
  drawPlayer();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
                                       
