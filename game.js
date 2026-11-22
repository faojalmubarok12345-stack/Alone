const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE_SIZE = 16;
const cols = Math.floor(canvas.width / TILE_SIZE);
const rows = Math.floor(canvas.height / TILE_SIZE);

// Setiap petak menyimpan state:
// state: 0 = rumput, 1 = tanah garapan
// crop: null | { watered: boolean, growth: number, ready: boolean }
const tiles = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => ({
    state: 0,
    crop: null
  }))
);

const player = {
  x: 152,
  y: 82,
  width: 16,
  height: 16,
  speed: 1.5,
  targetX: null,
  targetY: null,
  pendingTile: null, // menyimpan { col, row } untuk diinteraksi setelah sampai
  color: "#ffeaa7"
};

function getCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

// Interaksi saat karakter tiba di petak tujuan
function interactWithTile(col, row) {
  if (row < 0 || row >= rows || col < 0 || col >= cols) return;
  const tile = tiles[row][col];

  // 1. Rumput -> Cangkul jadi tanah garapan
  if (tile.state === 0) {
    tile.state = 1;
    return;
  }

  // 2. Tanah garapan kosong -> Tanam bibit
  if (tile.state === 1 && !tile.crop) {
    tile.crop = {
      watered: false,
      growth: 0,
      ready: false
    };
    return;
  }

  // 3. Ada tanaman & belum disiram -> Siram
  if (tile.crop && !tile.crop.watered && !tile.crop.ready) {
    tile.crop.watered = true;
    return;
  }

  // 4. Tanaman sudah siap panen -> Panen (kembali jadi tanah garapan)
  if (tile.crop && tile.crop.ready) {
    tile.crop = null;
  }
}

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  const pos = getCanvasCoords(e.clientX, e.clientY);

  const col = Math.floor(pos.x / TILE_SIZE);
  const row = Math.floor(pos.y / TILE_SIZE);

  // Target gerak ke tengah petak yang disentuh
  player.targetX = col * TILE_SIZE;
  player.targetY = row * TILE_SIZE;
  player.pendingTile = { col, row };
});

function updateCrops() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const crop = tiles[r][c].crop;
      if (crop && crop.watered && !crop.ready) {
        crop.growth += 1;
        // Sekitar 3 detik pada 60fps setelah disiram langsung siap panen untuk tes cepat
        if (crop.growth >= 180) {
          crop.ready = true;
        }
      }
    }
  }
}

function update() {
  updateCrops();

  if (player.targetX !== null && player.targetY !== null) {
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= player.speed) {
      player.x = player.targetX;
      player.y = player.targetY;
      player.targetX = null;
      player.targetY = null;

      if (player.pendingTile) {
        interactWithTile(player.pendingTile.col, player.pendingTile.row);
        player.pendingTile = null;
      }
    } else {
      player.x += (dx / distance) * player.speed;
      player.y += (dy / distance) * player.speed;
    }
  }
}

function drawGrid() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = tiles[r][c];
      const tileX = c * TILE_SIZE;
      const tileY = r * TILE_SIZE;

      // Warna dasar: rumput hijau, tanah garapan cokelat, tanah disiram cokelat lebih gelap
      if (tile.state === 0) {
        ctx.fillStyle = "#4ea853";
      } else {
        ctx.fillStyle = tile.crop && tile.crop.watered ? "#7c4d25" : "#b87a3d";
      }
      ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

      // Garis petak tipis
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

      // Gambar placeholder tanaman (bibit kecil vs tanaman siap panen)
      if (tile.crop) {
        if (tile.crop.ready) {
          ctx.fillStyle = "#ffeaa7";
          ctx.fillRect(tileX + 3, tileY + 3, 10, 10);
        } else {
          ctx.fillStyle = "#badc58";
          ctx.fillRect(tileX + 6, tileY + 6, 4, 4);
        }
      }
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
                          
