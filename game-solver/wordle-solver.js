// Wordle Solver (separated)
// New UI: 6x5 board, click tiles to cycle colors, confirm to lock row

(function () {
  // Build a clean 5-letter dictionary from WORDLE_WORDS
  const WORDLE_DICT = Array.from(
    new Set(
      (typeof WORDLE_WORDS !== "undefined" ? WORDLE_WORDS : [])
        .map((w) => (w || "").toString().trim().toLowerCase())
    )
  ).filter((w) => /^[a-z]{5}$/.test(w));

  const STATES = ["absent", "present", "correct"]; // gray -> yellow -> green

  document.addEventListener("DOMContentLoaded", () => {
    setupWordle();
  });

  function setupWordle() {
    // Initialize internal tiles structure
    state.wordle.tiles = buildBoard();

    // Wire buttons
    document.getElementById("reset-wordle").addEventListener("click", resetWordle);
    document.getElementById("wordle-back").addEventListener("click", goBackWordle);
    document.getElementById("wordle-confirm").addEventListener("click", confirmCurrentRow);
    document.getElementById("wordle-suggest").addEventListener("click", suggestNext);

    // Show openers
    const openers = rankWordleCandidates(WORDLE_DICT, getWordleKnowledge([])).slice(0, 5);
    renderWordleSuggestions(openers);
    setWordleMessage("Type a word in row 1, then click tiles to set colors.", 0);
  }

  function buildBoard() {
    const boardEl = document.getElementById("wordle-board");
    boardEl.innerHTML = "";
    const tiles = [];
    for (let r = 0; r < 6; r++) {
      const row = [];
      for (let c = 0; c < 5; c++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.autocapitalize = "characters";
        input.className = "wordle-tile state-absent";
        input.dataset.state = "absent";
        input.addEventListener("input", () => handleInput(r, c));
        input.addEventListener("click", () => cycleState(r, c));
        input.addEventListener("keydown", (e) => handleKeydown(e, r, c));
        boardEl.appendChild(input);
        row.push({ input, state: "absent", locked: false });
      }
      tiles.push(row);
    }
    return tiles;
  }

  function handleInput(r, c) {
    const tile = state.wordle.tiles[r][c];
    if (tile.locked) return;
    const val = (tile.input.value || "").toUpperCase().replace(/[^A-Z]/g, "");
    tile.input.value = val;
    // Auto-advance within row
    if (val && c < 4) state.wordle.tiles[r][c + 1].input.focus();
  }

  function handleKeydown(e, r, c) {
    const tile = state.wordle.tiles[r][c];
    if (tile.locked) return;
    if (e.key === "Backspace" && !tile.input.value && c > 0) {
      state.wordle.tiles[r][c - 1].input.focus();
    }
    if (e.key === "Enter") {
      confirmCurrentRow();
    }
  }

  function cycleState(r, c) {
    const tile = state.wordle.tiles[r][c];
    if (tile.locked) return;
    if (!tile.input.value) return; // only cycle when there is a letter
    const idx = STATES.indexOf(tile.state);
    const next = STATES[(idx + 1) % STATES.length];
    setTileState(r, c, next);
  }

  function setTileState(r, c, stateName) {
    const tile = state.wordle.tiles[r][c];
    tile.state = stateName;
    tile.input.dataset.state = stateName;
    tile.input.classList.remove("state-absent", "state-present", "state-correct");
    tile.input.classList.add(`state-${stateName}`);
  }

  function currentRowIndex() {
    for (let r = 0; r < 6; r++) if (!state.wordle.tiles[r][0].locked) return r;
    return 6; // all locked
  }

  function rowLetters(r) {
    return state.wordle.tiles[r].map((t) => (t.input.value || "").toLowerCase());
  }

  function rowStatuses(r) {
    return state.wordle.tiles[r].map((t) => t.state);
  }

  function rowFilled(r) {
    return rowLetters(r).every((ch) => ch.length === 1);
  }

  function lockRow(r) {
    state.wordle.tiles[r].forEach((t) => {
      t.locked = true;
      t.input.classList.add("locked");
      t.input.disabled = true;
    });
  }

  function unlockRow(r) {
    state.wordle.tiles[r].forEach((t) => {
      t.locked = false;
      t.input.classList.remove("locked");
      t.input.disabled = false;
    });
  }

  function unlockAll() {
    for (let r = 0; r < 6; r++) {
      state.wordle.tiles[r].forEach((t) => {
        t.locked = false;
        t.input.classList.remove("locked");
        t.input.disabled = false;
      });
    }
  }

  function clearBoard() {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 5; c++) {
        const t = state.wordle.tiles[r][c];
        t.input.value = "";
        setTileState(r, c, "absent");
      }
    }
    unlockAll();
  }

  function resetWordle() {
    clearBoard();
    renderWordleSuggestions(rankWordleCandidates(WORDLE_DICT, getWordleKnowledge([])).slice(0, 5));
    setWordleMessage("Board reset. Type a word and set colors.", 0);
    state.wordle.tiles[0][0].input.focus();
  }

  function goBackWordle() {
    const used = collectLockedGuesses().length;
    if (used <= 0) {
      setWordleMessage("No previous row to edit.", 0);
      return;
    }
    const r = used - 1;
    unlockRow(r);
    // Recompute suggestions based on remaining locked rows
    const guesses = collectLockedGuesses();
    const knowledge = getWordleKnowledge(guesses);
    const filtered = filterWordleCandidates(WORDLE_DICT, guesses);
    const ranked = rankWordleCandidates(filtered, knowledge);
    renderWordleSuggestions(ranked.slice(0, 10));
    setWordleMessage("Editing previous row. Adjust colors and Confirm.", guesses.length);
    state.wordle.tiles[r][0].input.focus();
  }

  function confirmCurrentRow() {
    const r = currentRowIndex();
    if (r >= 6) return;
    if (!rowFilled(r)) {
      setWordleMessage("Fill all 5 letters before confirming.");
      return;
    }
    lockRow(r);
    const guesses = collectLockedGuesses();
    const knowledge = getWordleKnowledge(guesses);
    const filtered = filterWordleCandidates(WORDLE_DICT, guesses);
    const ranked = rankWordleCandidates(filtered, knowledge);
    const used = guesses.length;
    renderWordleSuggestions(ranked.slice(0, 10));
    const top = ranked[0];
    setWordleMessage(top ? `Consider guessing "${top}" next.` : "Keep refining the clues.", used);
    // focus next row
    const next = currentRowIndex();
    if (next < 6) state.wordle.tiles[next][0].input.focus();
  }

  function collectLockedGuesses() {
    const guesses = [];
    for (let r = 0; r < 6; r++) {
      if (!state.wordle.tiles[r][0].locked) break;
      const letters = rowLetters(r);
      const statuses = rowStatuses(r);
      guesses.push({ letters, statuses });
    }
    return guesses;
  }

  function suggestNext() {
    const r = currentRowIndex();
    const guesses = collectLockedGuesses();
    const used = guesses.length;
    if (used >= 6) {
      renderWordleSuggestions([]);
      setWordleMessage("You have used all 6 guesses.", used);
      return;
    }
    const knowledge = getWordleKnowledge(guesses);
    const filtered = filterWordleCandidates(WORDLE_DICT, guesses);
    if (!filtered.length) {
      renderWordleSuggestions([]);
      setWordleMessage("No words fit those clues. Double-check entries.", used);
      return;
    }
    const ranked = rankWordleCandidates(filtered, knowledge);
    const mustRepeat = [...knowledge.minCounts.values()].some((v) => v >= 2);
    const noRepeat = ranked.filter((w) => new Set(w).size === 5);
    const finalList = !mustRepeat && noRepeat.length ? noRepeat : ranked;
    renderWordleSuggestions(finalList.slice(0, 10));
    const top = finalList[0];
    if (typeof top === "string" && r < 6) {
      // Fill current row with suggestion as grey until user sets feedback
      for (let c = 0; c < 5; c++) {
        const t = state.wordle.tiles[r][c];
        if (!t.locked) {
          t.input.value = top[c].toUpperCase();
          setTileState(r, c, "absent");
        }
      }
      state.wordle.tiles[r][0].input.focus();
      setWordleMessage(`Suggested: ${top}. Click tiles to set colors, then Confirm.`, used);
    } else {
      setWordleMessage("No suitable suggestion found.", used);
    }
  }

  function setWordleMessage(text, usedGuesses) {
    const messageEl = document.getElementById("wordle-message");
    const count = usedGuesses ?? collectLockedGuesses().length;
    messageEl.textContent = `${text} (Guesses: ${count}/6)`;
  }

  function getWordleKnowledge(guesses) {
    const greens = new Map();
    const minCounts = new Map();
    const maxCounts = new Map();
    const excludedPositions = new Map();
    const seenLetters = new Set();

    guesses.forEach(({ letters, statuses }) => {
      const letterTally = new Map();
      letters.forEach((letter, idx) => {
        seenLetters.add(letter);
        const status = statuses[idx];
        const tally = letterTally.get(letter) || { correct: 0, present: 0, absent: 0 };
        tally[status] = (tally[status] || 0) + 1;
        letterTally.set(letter, tally);

        if (status === "correct") greens.set(idx, letter);
        if (status === "present") {
          const set = excludedPositions.get(letter) || new Set();
          set.add(idx);
          excludedPositions.set(letter, set);
        }
        if (status === "absent" && !excludedPositions.has(letter)) {
          excludedPositions.set(letter, new Set());
        }
      });

      letterTally.forEach((counts, letter) => {
        const min = counts.correct + counts.present;
        if (min) minCounts.set(letter, Math.max(minCounts.get(letter) || 0, min));
        if (counts.absent && !min) {
          maxCounts.set(letter, 0);
        } else if (counts.absent) {
          const limit = min;
          const current = maxCounts.has(letter) ? Math.min(maxCounts.get(letter), limit) : limit;
          maxCounts.set(letter, current);
        }
      });
    });

    const absentLetters = new Set();
    maxCounts.forEach((max, letter) => {
      if ((max ?? Infinity) === 0 && !minCounts.has(letter)) absentLetters.add(letter);
    });

    const presentLetters = new Set([...minCounts.keys()]);
    return { greens, minCounts, maxCounts, excludedPositions, seenLetters, absentLetters, presentLetters };
  }

  function filterWordleCandidates(words, guesses) {
    const { greens, minCounts, maxCounts, excludedPositions } = getWordleKnowledge(guesses);
    return words.filter((word) => {
      for (const [idx, letter] of greens.entries()) if (word[idx] !== letter) return false;

      for (const [letter, min] of minCounts.entries()) if (countLetter(word, letter) < min) return false;

      for (const [letter, set] of excludedPositions.entries()) {
        if (!minCounts.has(letter) && (maxCounts.get(letter) ?? Infinity) === 0) {
          if (word.includes(letter)) return false;
        } else {
          for (const pos of set) if (word[pos] === letter) return false;
        }
      }

      for (const [letter, max] of maxCounts.entries()) if (countLetter(word, letter) > max) return false;

      return true;
    });
  }

  function countLetter(word, letter) {
    return word.split("").filter((ch) => ch === letter).length;
  }

  function rankWordleCandidates(words, knowledge) {
    const { seenLetters = new Set(), absentLetters = new Set(), minCounts = new Map(), presentLetters = new Set(), greens = new Map() } = knowledge || {};

    // Frequency score for coverage
    const freq = new Map();
    words.forEach((word) => {
      const unique = new Set(word);
      unique.forEach((letter) => freq.set(letter, (freq.get(letter) || 0) + 1));
    });

    const mustRepeat = [...minCounts.values()].some((v) => v >= 2);
    const confirmed = new Set([...presentLetters, ...greens.values()]);

    const scored = words.map((word) => {
      const chars = word.split("");
      const unique = new Set(chars);
      let score = 0;

      // Base coverage score
      unique.forEach((letter) => (score += freq.get(letter) || 0));

      // Reward new letters, penalize reusing unhelpful letters
      chars.forEach((letter) => {
        if (absentLetters.has(letter)) score -= 100; // should already be filtered
        else if (!seenLetters.has(letter)) score += 1.0; // new info
        else if (!confirmed.has(letter)) score -= 1.0; // previously seen and not helpful
      });

      // Prefer no duplicates unless evidence suggests repeat
      if (unique.size < 5 && !mustRepeat) score -= 2.0;

      return { word, score };
    });

    scored.sort((a, b) => b.score - a.score || a.word.localeCompare(b.word));
    return scored.map((e) => e.word);
  }

  function renderWordleSuggestions(list) {
    const container = document.getElementById("wordle-suggestions");
    container.innerHTML = "";
    list.forEach((word) => {
      const item = document.createElement("li");
      item.textContent = word;
      container.appendChild(item);
    });
  }
})();
