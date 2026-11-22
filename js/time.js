const GameTime = (() => {
  // 1 menit dunia nyata (60 detik) = 1 jam game (60 menit game)
  // Jadi setiap 1 detik nyata = 1 menit dalam game
  const REAL_MS_PER_GAME_MINUTE = 1000;

  let day = 1;
  let totalMinutes = 6 * 60; // Mulai jam 06:00 (360 menit dari 00:00)
  let accumulatorMs = 0;

  function formatTime(mins) {
    const wrapped = ((mins % 1440) + 1440) % 1440;
    const hours = Math.floor(wrapped / 60);
    const minutes = Math.floor(wrapped % 60);
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function advanceDay() {
    day += 1;
    totalMinutes = 6 * 60; // Kembali ke 06:00 pagi di hari baru
  }

  function update(dtMs) {
    accumulatorMs += dtMs;

    while (accumulatorMs >= REAL_MS_PER_GAME_MINUTE) {
      accumulatorMs -= REAL_MS_PER_GAME_MINUTE;
      totalMinutes += 1;

      // Ganti hari otomatis saat melewati 24:00 (1440 menit)
      if (totalMinutes >= 24 * 60) {
        advanceDay();
      }
    }
  }

  // Warna overlay suasana siang / sore / malam
  function getAmbientOverlay() {
    const hour = Math.floor((totalMinutes % 1440) / 60);

    if (hour >= 6 && hour < 17) {
      return null; // Siang cerah
    }
    if (hour >= 17 && hour < 20) {
      return "rgba(255, 140, 66, 0.16)"; // Sore keemasan
    }
    return "rgba(15, 23, 56, 0.42)"; // Malam hari
  }

  function renderHud() {
    const dayEl = document.getElementById("hud-day");
    const timeEl = document.getElementById("hud-time");
    if (dayEl) dayEl.textContent = `Day ${day}`;
    if (timeEl) timeEl.textContent = formatTime(totalMinutes);
  }

  function getState() {
    return { day, totalMinutes };
  }

  return {
    update,
    renderHud,
    getAmbientOverlay,
    getState
  };
})();
    
