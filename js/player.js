const GamePlayer = (() => {
  const state = {
    x: 144,
    y: 64,
    width: 16,
    height: 16,
    speed: 1.5,
    targetX: null,
    targetY: null,
    pendingTile: null,
    color: "#ffeaa7"
  };

  function init(startX = 144, startY = 64) {
    state.x = startX;
    state.y = startY;
    state.targetX = null;
    state.targetY = null;
    state.pendingTile = null;
  }

  // Atur tujuan jalan saat petak disentuh
  function setMoveTarget(col, row, tileSize, boundsWidth, boundsHeight) {
    const { cols, rows } = GameWorld.getDimensions();
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;

    const targetTileX = col * tileSize;
    const targetTileY = row * tileSize;

    // Jika karakter sudah berada di sebelah / dekat petak sasaran, langsung aksi
    const distToTile = Math.hypot(targetTileX - state.x, targetTileY - state.y);
    if (distToTile <= tileSize * 1.5 && distToTile > 2) {
      state.targetX = null;
      state.targetY = null;
      state.pendingTile = null;

      const selected =
        typeof GameInventory !== "undefined" ? GameInventory.getSelected() : null;
      GameWorld.interactAt(col, row, selected);
      return;
    }

    // Pilih petak tetangga terdekat agar karakter tidak menindih petak sasaran
    const neighbors = [
      { x: targetTileX - tileSize, y: targetTileY },
      { x: targetTileX + tileSize, y: targetTileY },
      { x: targetTileX, y: targetTileY - tileSize },
      { x: targetTileX, y: targetTileY + tileSize }
    ].filter(
      (p) =>
        p.x >= 0 &&
        p.x <= boundsWidth - state.width &&
        p.y >= 0 &&
        p.y <= boundsHeight - state.height
    );

    let stopPoint = { x: targetTileX, y: targetTileY };
    if (neighbors.length > 0) {
      neighbors.sort(
        (a, b) =>
          Math.hypot(a.x - state.x, a.y - state.y) -
          Math.hypot(b.x - state.x, b.y - state.y)
      );
      stopPoint = neighbors[0];
    }

    state.targetX = stopPoint.x;
    state.targetY = stopPoint.y;
    state.pendingTile = { col, row };
  }

  function update() {
    if (state.targetX !== null && state.targetY !== null) {
      const dx = state.targetX - state.x;
      const dy = state.targetY - state.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= state.speed) {
        state.x = state.targetX;
        state.y = state.targetY;
        state.targetX = null;
        state.targetY = null;

        if (state.pendingTile) {
          const { col, row } = state.pendingTile;
          state.pendingTile = null;
          const selected =
            typeof GameInventory !== "undefined"
              ? GameInventory.getSelected()
              : null;
          GameWorld.interactAt(col, row, selected);
        }
      } else {
        state.x += (dx / distance) * state.speed;
        state.y += (dy / distance) * state.speed;
      }
    }
  }

  function draw(ctx, tileSize) {
    if (state.pendingTile) {
      const tx = state.pendingTile.col * tileSize;
      const ty = state.pendingTile.row * tileSize;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.strokeRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
    }

    ctx.fillStyle = state.color;
    ctx.fillRect(state.x, state.y, state.width, state.height);
  }

  return {
    init,
    setMoveTarget,
    update,
    draw
  };
})();
  
