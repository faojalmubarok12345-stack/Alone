const GameAssets = (() => {
  const sprites = {};

  function loadSprite(key, src) {
    const img = new Image();
    img.loaded = false;
    img.onload = () => {
      img.loaded = true;
    };
    img.onerror = () => {
      img.loaded = false;
    };
    img.src = src;
    sprites[key] = img;
  }

  function init() {
    loadSprite("grass", "assets/tiles/grass.png");
    loadSprite("dirt", "assets/tiles/dirt.png");
    loadSprite("dirt_wet", "assets/tiles/dirt_wet.png");
    loadSprite("crop_seed", "assets/crops/seed.png");
    loadSprite("crop_sprout", "assets/crops/sprout.png");
    loadSprite("crop_ripe", "assets/crops/ripe.png");
    loadSprite("player", "assets/player/player.png");
  }

  function drawOrFallback(ctx, key, x, y, w, h, fallbackColor, inset = 0) {
    const img = sprites[key];
    if (img && img.loaded) {
      ctx.drawImage(img, x, y, w, h);
      return true;
    }

    if (fallbackColor) {
      ctx.fillStyle = fallbackColor;
      ctx.fillRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
    }
    return false;
  }

  return {
    init,
    drawOrFallback
  };
})();
      
