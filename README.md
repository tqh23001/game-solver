# Game Solver (Puzzle Solver Hub)

A lightweight, static web app that helps you play and solve three popular games:
- Wordle: 6×5 in-browser board with suggestions and clue tracking
- Sudoku: One‑click backtracking solver
- Minesweeper: An assistant that marks guaranteed safe/mine tiles

Open `index.html` in any modern browser to use it offline.

## Features

### Wordle Solver
- 6×5 grid UI like the real game
- Type words directly into tiles, click a tile to change colors to: gray → yellow → green
- Confirm Row: locks the row (letters + colors) and updates solver knowledge
- Suggest Next Guess: fills the current row with the top suggestion (no repeats unless required)
- Go Back: unlocks the previous locked row so you can fix mistakes
- Tracks guesses (Guesses: n/6) and stops suggesting after 6

How to use:
1. Click “Suggest Next Guess” to get a word.
2. Type that word in the real Wordle game.
3. Enter the same letters here (auto-fills when you click Suggest).
4. Click each tile to set colors to match Wordle’s feedback.
5. Click “Confirm Row” to lock the guess.
6. If you made a mistake, click “Go Back” to edit the previous row.
7. Click “Suggest Next Guess” for the next word.

Notes:
- The solver avoids reusing known grey letters and prefers unique‑letter guesses unless repeats are implied by the clues.
- The dictionary is sanitized at runtime to 5‑letter words from `wordle-words.js`.

### Sudoku Solver
- Clean 9×9 grid input
- “Solve Sudoku” runs a backtracking solver
- “Clear” resets the grid

### Minesweeper Assistant
- Adjustable board size (2–12 rows/cols)
- Enter numbers, `F` for flag, and `?` for hidden tiles
- “Analyze Board” highlights:
  - Safe to reveal tiles
  - Guaranteed mines to mark

## Quick Start
- Option A: Double‑click `index.html` to open in your default browser.
- Option B (recommended for strict browsers): Serve the folder locally.
  - Python: `python -m http.server` (then open http://localhost:8000/game-solver/)
  - Node (http-server): `npx http-server` (open the printed URL)

## Project Structure
- `index.html` — App shell and sections for each game
- `style.css` — Shared styles + game‑specific UI
- `script.js` — Global app state + game selector (no solver logic)
- `wordle-words.js` — Wordle dictionary (sanitized to 5‑letter words at runtime)
- `wordle-solver.js` — Wordle board UI + suggestion engine
- `sudoku-solver.js` — Sudoku grid + solver
- `minesweeper-solver.js` — Minesweeper grid + deterministic assistant

## Customization
- Wordle dictionary: edit `wordle-words.js`. Non‑5‑letter entries are ignored at runtime.
- Minesweeper size: change rows/cols in the UI (2–12).
- Styles: tweak tile sizes/colors in `.wordle-board` and `.wordle-tile` within `style.css`.

## Limitations
- Wordle suggestions use a heuristic (frequency + knowledge). They’re optimized to avoid bad repeats and reuse of grays but aren’t guaranteed optimal.
- Minesweeper only applies deterministic rules; it won’t guess in ambiguous situations.
- Sudoku solver uses straightforward backtracking (fast for typical puzzles but not optimized for the hardest variants).

## Contributing
PRs and suggestions are welcome. Keep changes focused and minimal, match the existing code style, and avoid adding heavy dependencies for this static app.

