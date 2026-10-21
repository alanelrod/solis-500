document.querySelectorAll("[data-map]").forEach((map) => {
  const stage = map.querySelector(".map-stage");
  const viewport = map.querySelector(".map-viewport");
  const view = { x: 0, y: 0, scale: 1 };
  let dragging = false;
  let moved = false;
  let lastX = 0;
  let lastY = 0;

  function apply() {
    stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    stage.style.setProperty("--pin-scale", String(Math.max(0.55, Math.min(1, 1 / Math.sqrt(view.scale)))));
  }

  function zoomAt(clientX, clientY, next) {
    const rect = viewport.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const scale = Math.max(1, Math.min(8, next));
    const ratio = scale / view.scale;
    view.x = px - (px - view.x) * ratio;
    view.y = py - (py - view.y) * ratio;
    view.scale = scale;
    apply();
  }

  map.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest(".map-controls, .map-pin")) return;
    dragging = true;
    moved = false;
    lastX = event.clientX;
    lastY = event.clientY;
    map.classList.add("is-dragging");
    map.setPointerCapture(event.pointerId);
  });
  map.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    if (dx * dx + dy * dy > 16) moved = true;
    if (!moved) return;
    lastX = event.clientX;
    lastY = event.clientY;
    view.x += dx;
    view.y += dy;
    apply();
  });
  function endDrag() {
    dragging = false;
    map.classList.remove("is-dragging");
  }
  map.addEventListener("pointerup", endDrag);
  map.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, view.scale * (event.deltaY > 0 ? 0.9 : 1.12));
  }, { passive: false });
  map.addEventListener("click", (event) => {
    const zoom = event.target.closest("[data-zoom]");
    if (zoom) {
      const rect = viewport.getBoundingClientRect();
      const action = zoom.dataset.zoom;
      if (action === "reset") {
        view.x = 0;
        view.y = 0;
        view.scale = 1;
        apply();
      } else {
        zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, view.scale * (action === "out" ? 0.82 : 1.22));
      }
      return;
    }
    if (moved && event.target.closest(".map-pin")) event.preventDefault();
    moved = false;
  });
  map.addEventListener("mousemove", (event) => {
    const pin = event.target.closest(".map-pin");
    let tip = map.querySelector(".map-tip");
    if (!pin) {
      if (tip) tip.hidden = true;
      return;
    }
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "map-tip";
      map.append(tip);
    }
    tip.hidden = false;
    tip.replaceChildren();
    const name = document.createElement("b");
    name.textContent = pin.dataset.name || "";
    const note = document.createElement("span");
    note.textContent = pin.dataset.note || "";
    tip.append(name, note);
    const rect = map.getBoundingClientRect();
    tip.style.left = `${event.clientX - rect.left + 14}px`;
    tip.style.top = `${event.clientY - rect.top + 14}px`;
  });
  map.addEventListener("mouseleave", () => {
    const tip = map.querySelector(".map-tip");
    if (tip) tip.hidden = true;
  });
});
