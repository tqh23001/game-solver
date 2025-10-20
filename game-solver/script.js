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

