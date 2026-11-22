const GameWorld = (() => {
  const TILE_SIZE = 16;

  let cols = 0;
  let rows = 0;
  let tiles = [];
  let effect = null;

  function init(canvasWidth, canvasHeight) {
    cols = Math.floor(canvasWidth / TILE_SIZE);
    rows = Math.floor(canvasHeight / TILE_SIZE);

    tiles = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        state: 0, // 0 = rumput, 1 = tanah garapan
        crop: null // null | { watered: boolean, growth: number, ready: boolean }
      }))
    );
  }

  function triggerEffect(col, row, color) {
    effect = {
      x: col * TILE_SIZE,
      y: row * TILE_SIZE,
      color,
      timer: 12
    };
  }

  // Interaksi petak berdasarkan slot aktif di hotbar inventori
  function interactAt(col, row, selectedItem) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    const tile = tiles[row][col];
    const toolId = selectedItem ? selectedItem.id : "hoe";

    // Panen selalu bisa dilakukan kalau tanaman sudah siap panen
    if (tile.crop && tile.crop.ready && (toolId === "harvest" || toolId === "hoe" || toolId === "hand")) {
      tile.crop = null;
      if (typeof GameInventory !== "undefined") {
        GameInventory.addCrop(1);
      }
      triggerEffect(col, row, "#ffeaa7");
      return;
    }

    if (toolId === "hoe") {
      if (tile.state === 0) {
        tile.state = 1;
        triggerEffect(col, row, "#ffffff");
      }
      return;
    }

    if (toolId === "seed") {
      if (tile.state === 1 && !tile.crop) {
        const canPlant =
          typeof GameInventory !== "undefined" ? GameInventory.useSeed() : true;
        if (canPlant) {
          tile.crop = {
            watered: false,
            growth: 0,
            ready: false
          };
          triggerEffect(col, row, "#badc58");
        }
      }
      return;
    }

    if (toolId === "water") {
      if (tile.crop && !tile.crop.watered && !tile.crop.ready) {
        tile.crop.watered = true;
        triggerEffect(col, row, "#74b9ff");
      }
      return;
    }

    if (toolId === "harvest") {
      if (tile.crop && tile.crop.ready) {
        tile.crop = null;
        if (typeof GameInventory !== "undefined") {
          GameInventory.addCrop(1);
        }
        triggerEffect(col, row, "#ffeaa7");
      }
    }
  }

  function update() {
    if (effect) {
      effect.timer -= 1;
      if (effect.timer <= 0) effect = null;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const crop = tiles[r][c].crop;
        if (crop && crop.watered && !crop.ready) {
          crop.growth += 1;
          // ~3 detik pada 60fps setelah disiram agar mudah dites
          if (crop.growth >= 180) {
            crop.ready = true;
          }
        }
      }
    }
  }

  function draw(ctx) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = tiles[r][c];
        const tileX = c * TILE_SIZE;
        const tileY = r * TILE_SIZE;

        if (tile.state === 0) {
          ctx.fillStyle = "#4ea853";
        } else {
          ctx.fillStyle = tile.crop && tile.crop.watered ? "#7c4d25" : "#b87a3d";
        }
        ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
        ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

        if (tile.crop) {
          if (tile.crop.ready) {
            ctx.fillStyle = "#ffeaa7";
            ctx.fillRect(tileX + 3, tileY + 3, 10, 10);
          } else if (tile.crop.growth >= 90) {
            ctx.fillStyle = "#78e08f";
            ctx.fillRect(tileX + 5, tileY + 5, 6, 6);
          } else {
            ctx.fillStyle = "#badc58";
            ctx.fillRect(tileX + 6, tileY + 6, 4, 4);
          }
        }
      }
    }

    if (effect) {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        effect.x + 1,
        effect.y + 1,
        TILE_SIZE - 2,
        TILE_SIZE - 2
      );
      ctx.lineWidth = 1;
    }
  }

  function getTileSize() {
    return TILE_SIZE;
  }

  function getDimensions() {
    return { cols, rows };
  }

  return {
    init,
    interactAt,
    update,
    draw,
    getTileSize,
    getDimensions
  };
})();
                              
