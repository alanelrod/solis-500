const menuButton = document.querySelector("#menu-button");
const menuPanel = document.querySelector("#menu-panel");

function setMenu(open) {
  menuPanel.hidden = !open;
  menuButton.setAttribute("aria-expanded", open ? "true" : "false");
}

menuButton.addEventListener("click", () => {
  setMenu(menuPanel.hidden);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".menu")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});
