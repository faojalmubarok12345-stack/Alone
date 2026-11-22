(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const tileSize = GameWorld.getTileSize();

  // Inisialisasi dunia, karakter, dan hotbar inventori
  GameWorld.init(canvas.width, canvas.height);
  GamePlayer.init(144, 64);
  if (typeof GameInventory !== "undefined") {
    GameInventory.render();
  }
  if (typeof GameTime !== "undefined") {
    GameTime.renderHud();
  }

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
    const col = Math.floor(pos.x / tileSize);
    const row = Math.floor(pos.y / tileSize);

    GamePlayer.setMoveTarget(col, row, tileSize, canvas.width, canvas.height);
  });

  let lastTimestamp = performance.now();

  function update(dtMs) {
    if (typeof GameTime !== "undefined") {
      GameTime.update(dtMs);
      GameTime.renderHud();
    }
    GameWorld.update();
    GamePlayer.update();
  }

  function drawAmbientOverlay() {
    if (typeof GameTime === "undefined") return;
    const overlayColor = GameTime.getAmbientOverlay();
    if (!overlayColor) return;

    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    GameWorld.draw(ctx);
    GamePlayer.draw(ctx, tileSize);
    drawAmbientOverlay();
  }

  function loop(now) {
    const dtMs = Math.min(now - lastTimestamp, 100);
    lastTimestamp = now;

    update(dtMs);
    draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
  
