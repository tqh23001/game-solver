// Minesweeper Assistant (separated)
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    setupMinesweeper();
  });

  function setupMinesweeper() {
    const settingsForm = document.getElementById("minesweeper-settings");
    const analyzeBtn = document.getElementById("analyze-minesweeper");
    const clearBtn = document.getElementById("clear-minesweeper");

    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const rows = clampValue(parseInt(document.getElementById("minesweeper-rows").value, 10), 2, 12);
      const cols = clampValue(parseInt(document.getElementById("minesweeper-cols").value, 10), 2, 12);
      document.getElementById("minesweeper-rows").value = rows;
      document.getElementById("minesweeper-cols").value = cols;
      state.minesweeper.rows = rows;
      state.minesweeper.cols = cols;
      buildMinesweeperGrid(rows, cols);
    });

    analyzeBtn.addEventListener("click", () => analyzeMinesweeper());
    clearBtn.addEventListener("click", () => resetMinesweeper());

    buildMinesweeperGrid(state.minesweeper.rows, state.minesweeper.cols);
  }

  function clampValue(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  function buildMinesweeperGrid(rows, cols) {
    const gridEl = document.getElementById("minesweeper-grid");
    gridEl.innerHTML = "";
    gridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(40px, 1fr))`;

    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const input = document.createElement("input");
        input.className = "minesweeper-cell";
        input.maxLength = 1;
        input.placeholder = "?";
        input.addEventListener("input", () => {
          input.value = input.value.toUpperCase();
          if (!/^([0-8]|F|\?)$/.test(input.value)) {
            input.value = input.value.replace(/[^0-8F\?]/g, "");
          }
        });
        gridEl.appendChild(input);
        row.push(input);
      }
      grid.push(row);
    }
    state.minesweeper.grid = grid;
    document.getElementById("minesweeper-message").textContent = "";
    document.getElementById("minesweeper-suggestions").innerHTML = "";
  }

  function readMinesweeperGrid() {
    return state.minesweeper.grid.map((row) =>
      row.map((cell) => {
        const value = cell.value.trim().toUpperCase();
        if (value === "") return "?";
        if (value === "F" || value === "?") return value;
        const num = parseInt(value, 10);
        if (Number.isNaN(num) || num < 0 || num > 8) return "?";
        return num;
      })
    );
  }

  function analyzeMinesweeper() {
    const board = readMinesweeperGrid();
    const rows = board.length;
    const cols = board[0].length;

    const safe = new Set();
    const mines = new Set();

    const key = (r, c) => `${r},${c}`;

    const neighbors = (r, c) => {
      const coords = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            coords.push([nr, nc]);
          }
        }
      }
      return coords;
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (typeof cell !== "number") continue;
        const neigh = neighbors(r, c);
        let flagged = 0;
        const unknown = [];
        neigh.forEach(([nr, nc]) => {
          const value = board[nr][nc];
          if (value === "F") flagged += 1;
          else if (value === "?") unknown.push([nr, nc]);
        });

        if (cell === flagged && unknown.length) unknown.forEach(([nr, nc]) => safe.add(key(nr, nc)));
        if (cell === flagged + unknown.length && unknown.length) unknown.forEach(([nr, nc]) => mines.add(key(nr, nc)));
      }
    }

    const suggestionsEl = document.getElementById("minesweeper-suggestions");
    suggestionsEl.innerHTML = "";

    if (!safe.size && !mines.size) {
      document.getElementById("minesweeper-message").textContent =
        "No certain moves found. Try revealing a tile with the best odds.";
      return;
    }

    if (safe.size) {
      const item = document.createElement("li");
      item.textContent = `Safe to reveal: ${Array.from(safe)
        .map((coord) => formatCellLabel(coord))
        .join(", ")}`;
      suggestionsEl.appendChild(item);
    }

    if (mines.size) {
      const item = document.createElement("li");
      item.textContent = `Mark as mines: ${Array.from(mines)
        .map((coord) => formatCellLabel(coord))
        .join(", ")}`;
      suggestionsEl.appendChild(item);
    }

    document.getElementById("minesweeper-message").textContent =
      "These moves are guaranteed based on the current information.";
  }

  function formatCellLabel(coord) {
    const [r, c] = coord.split(",").map((v) => parseInt(v, 10));
    const rowLabel = r + 1;
    const colLabel = String.fromCharCode(65 + c);
    return `${colLabel}${rowLabel}`;
  }

  function resetMinesweeper() {
    state.minesweeper.grid.flat().forEach((cell) => (cell.value = ""));
    document.getElementById("minesweeper-message").textContent = "";
    document.getElementById("minesweeper-suggestions").innerHTML = "";
  }
})();

