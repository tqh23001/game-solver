// Sudoku Solver (separated)
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    setupSudoku();
  });

  function setupSudoku() {
    const gridEl = document.getElementById("sudoku-grid");
    gridEl.innerHTML = "";
    const cells = [];
    for (let i = 0; i < 81; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^1-9]/g, "");
      });
      gridEl.appendChild(input);
      cells.push(input);
    }
    state.sudoku.grid = cells;

    document.getElementById("solve-sudoku").addEventListener("click", () => solveSudoku());
    document.getElementById("clear-sudoku").addEventListener("click", () => clearSudoku());
  }

  function readSudokuGrid() {
    const values = [];
    for (let row = 0; row < 9; row++) {
      values[row] = [];
      for (let col = 0; col < 9; col++) {
        const value = state.sudoku.grid[row * 9 + col].value;
        values[row][col] = value ? parseInt(value, 10) : 0;
      }
    }
    return values;
  }

  function writeSudokuGrid(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col] || "";
        state.sudoku.grid[row * 9 + col].value = value ? String(value) : "";
      }
    }
  }

  function solveSudoku() {
    const messageEl = document.getElementById("sudoku-message");
    const board = readSudokuGrid();
    if (solveSudokuBacktrack(board)) {
      writeSudokuGrid(board);
      messageEl.textContent = "Puzzle solved!";
    } else {
      messageEl.textContent = "No valid solution found with the given clues.";
    }
  }

  function solveSudokuBacktrack(board) {
    const empty = findEmptyCell(board);
    if (!empty) return true;
    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (isValidSudokuMove(board, row, col, num)) {
        board[row][col] = num;
        if (solveSudokuBacktrack(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  function findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) return [row, col];
      }
    }
    return null;
  }

  function isValidSudokuMove(board, row, col, num) {
    for (let i = 0; i < 9; i++) if (board[row][i] === num || board[i][col] === num) return false;
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }
    return true;
  }

  function clearSudoku() {
    state.sudoku.grid.forEach((input) => (input.value = ""));
    document.getElementById("sudoku-message").textContent = "";
  }
})();

