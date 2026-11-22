const GameInventory = (() => {
  const slots = [
    { id: "hoe", label: "Cangkul", type: "tool", count: null },
    { id: "seed", label: "Bibit", type: "seed", count: 10 },
    { id: "water", label: "Siram", type: "tool", count: null },
    { id: "harvest", label: "Panen", type: "tool", count: null },
    { id: "crop", label: "Hasil", type: "crop", count: 0 },
    { id: "empty_1", label: "-", type: "empty", count: null },
    { id: "empty_2", label: "-", type: "empty", count: null },
    { id: "empty_3", label: "-", type: "empty", count: null }
  ];

  let selectedIndex = 0;

  function getSelected() {
    return slots[selectedIndex];
  }

  function selectSlot(index) {
    if (index >= 0 && index < slots.length) {
      selectedIndex = index;
      render();
    }
  }

  function useSeed() {
    const seedSlot = slots.find((s) => s.id === "seed");
    if (!seedSlot || seedSlot.count <= 0) return false;
    seedSlot.count -= 1;
    render();
    return true;
  }

  function addCrop(amount = 1) {
    const cropSlot = slots.find((s) => s.id === "crop");
    if (!cropSlot) return;
    cropSlot.count = (cropSlot.count || 0) + amount;
    render();
  }

  function render() {
    const container = document.getElementById("hotbar");
    if (!container) return;

    container.innerHTML = "";

    slots.forEach((slot, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot" + (idx === selectedIndex ? " active" : "");

      const labelSpan = document.createElement("span");
      labelSpan.textContent = slot.label;
      btn.appendChild(labelSpan);

      if (slot.count !== null) {
        const countSpan = document.createElement("span");
        countSpan.className = "slot-count";
        countSpan.textContent = `x${slot.count}`;
        btn.appendChild(countSpan);
      }

      btn.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        selectSlot(idx);
      });

      container.appendChild(btn);
    });
  }

  return {
    getSelected,
    selectSlot,
    useSeed,
    addCrop,
    render
  };
})();
    
