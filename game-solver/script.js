const state = {
  wordle: {
    rows: [],
  },
  sudoku: {
    grid: [],
  },
  minesweeper: {
    grid: [],
    rows: 6,
    cols: 6,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  setupGameSelector();
  setupThemeToggle();
});

function setupGameSelector() {
  const select = document.getElementById("game-select");
  const sections = {
    wordle: document.getElementById("wordle-section"),
    sudoku: document.getElementById("sudoku-section"),
    minesweeper: document.getElementById("minesweeper-section"),
  };

  select.addEventListener("change", () => {
    Object.entries(sections).forEach(([key, section]) => {
      if (key === select.value) {
        section.classList.remove("hidden");
      } else {
        section.classList.add("hidden");
      }
    });
  });
}

function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const root = document.documentElement;
  const stored = localStorage.getItem("theme") || "dark";
  if (stored === "light") root.setAttribute("data-theme", "light");
  btn.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight) {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  });
}
