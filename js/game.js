/**
 * Game engine (SRP: core loop and rules only). No DOM, no content data.
 * Depends on injected state, config, content, ui (DIP). Add new rules or modes without touching UI/content.
 */

function isOverlapping(x, y, used, w, h) {
  w = w || 80;
  h = h || 60;
  return used.some(
    (u) =>
      x < u.x + u.w + 20 &&
      x + w + 20 > u.x &&
      y < u.y + u.h + 20 &&
      y + h + 20 > u.y
  );
}

/**
 * @param {{ getState: () => any, updateState: (u: any) => any }} state
 * @param {{ getDifficultyConfig: (d: string) => any, CONFIG: any }} config
 * @param {{ getPool: (m: string, p: string) => any[], getSimilarDistractorPool: (...args: any[]) => any, getPromptLabel: (m: string, i: any) => string, getRandomItem: (a: any[]) => any, shuffle: (a: any[]) => any[] }} content
 * @param {ReturnType<typeof import('./ui.js')>} ui
 */
export function createGameEngine(state, config, content, ui) {
  function getCfg() {
    return config.getDifficultyConfig(state.getState().difficulty);
  }

  function createTargets() {
    const s = state.getState();
    if (s.nextTimeoutId) {
      clearTimeout(s.nextTimeoutId);
      state.updateState({ nextTimeoutId: null });
    }

    const cfg = getCfg();
    const roundMode = s.mode === "random" ? content.getRandomContentMode() : s.mode;
    state.updateState({ roundMode, correctHitCountThisRound: 0 });

    const pool = content.getPool(roundMode, cfg.poolSize);
    if (pool.length === 0) return;

    const targetItem = content.getRandomItem(pool);
    state.updateState({ targetItem });

    const correctCount = Math.max(1, cfg.correctCountPerRound ?? 1);
    const similarPool = content.getSimilarDistractorPool(roundMode, targetItem, pool, cfg.similarDistractors);
    const choices = [];
    for (let i = 0; i < correctCount; i++) choices.push(targetItem);
    const count = cfg.targetsPerRound;

    while (choices.length < count) {
      let item;
      if (similarPool && similarPool.length > 0 && Math.random() < 0.6) {
        item = content.getRandomItem(similarPool);
      } else {
        item = content.getRandomItem(pool);
      }
      if (item.value !== targetItem.value && !choices.some((c) => c.value === item.value)) {
        choices.push(item);
      }
    }
    const shuffled = content.shuffle(choices);

    const playArea = ui.getPlayArea();
    if (!playArea) return;
    const areaRect = playArea.getBoundingClientRect();
    const padding = 80;
    const sizeClass = "target-size-" + (cfg.targetSize || "medium");
    const w = cfg.targetSize === "large" ? 96 : cfg.targetSize === "small" ? 52 : 80;
    const h = cfg.targetSize === "large" ? 72 : cfg.targetSize === "small" ? 48 : 60;

    const targets = [];
    const used = [];

    shuffled.forEach((item) => {
      let x, y;
      let tries = 0;
      do {
        x = padding + Math.random() * (areaRect.width - padding * 2 - w);
        y = padding + Math.random() * (areaRect.height - padding * 2 - h);
        tries++;
      } while (isOverlapping(x, y, used, w, h) && tries < 50);
      used.push({ x, y, w, h });

      const el = ui.createTargetElement(item, sizeClass, x, y);
      ui.appendToPlayArea(el);
      targets.push({ el, item });
    });

    state.updateState({ targets });
    ui.setPrompt(content.getPromptLabel(roundMode, targetItem), targetItem.display);
  }

  function scheduleNextTargets() {
    const s = state.getState();
    const delay = Math.max(0, s.delayBeforeNext);
    const id = setTimeout(() => {
      state.updateState({ nextTimeoutId: null });
      createTargets();
    }, delay);
    state.updateState({ nextTimeoutId: id });
  }

  function clearCurrentTargets() {
    const s = state.getState();
    ui.clearTargets(s.targets);
    state.updateState({ targets: [] });
  }

  function hitTarget(el) {
    return el && el.classList && el.classList.contains("target");
  }

  function getTargetRecord(el) {
    const value = el && el.dataset && el.dataset.value;
    const targets = state.getState().targets;
    return targets.find((t) => String(t.item.value) === value);
  }

  function shoot() {
    const s = state.getState();
    if (!s.isPlaying || !s.targets.length) return;

    ui.playShootCursorAnimation();

    const cfg = getCfg();
    const el = ui.elementAt(s.cursorX, s.cursorY);

    if (!hitTarget(el)) {
      ui.showFeedback({ correct: false });
      if (cfg.wrongLoseLife && cfg.maxLives > 0) {
        state.updateState({ lives: s.lives - 1, consecutiveCorrect: 0 });
        ui.updateHUD(state.getState().score, state.getState().lives, cfg.maxLives);
        if (state.getState().lives <= 0) endGame();
      } else {
        state.updateState({ consecutiveCorrect: 0 });
      }
      return;
    }

    const correct = state.getState().targetItem && String(state.getState().targetItem.value) === el.dataset.value;

    if (correct) {
      const next = state.getState();
      const streak = next.consecutiveCorrect + 1;
      let points = cfg.correctPoints;
      if (cfg.comboBonus && streak > 1) points += (streak - 1) * 25;

      const record = getTargetRecord(el);
      const context = record && record.item.context ? record.item.context : null;
      const comboText = cfg.comboBonus && streak > 1 ? " " + streak + "× combo!" : null;

      const correctCountPerRound = Math.max(1, cfg.correctCountPerRound ?? 1);
      const newCorrectHitCount = next.correctHitCountThisRound + 1;

      state.updateState({
        score: next.score + points,
        consecutiveCorrect: streak,
        correctHitCountThisRound: newCorrectHitCount,
        targets: next.targets.filter((t) => t.el !== el),
      });
      ui.shatterTarget(el);

      if (newCorrectHitCount >= correctCountPerRound) {
        ui.showFeedback({ correct: true, context, comboText });
        setTimeout(() => {
          el.remove();
          clearCurrentTargets();
          scheduleNextTargets();
        }, 500);
      } else {
        const remaining = correctCountPerRound - newCorrectHitCount;
        ui.showFeedback({ correct: true, context: null, comboText: remaining > 0 ? remaining + " more!" : comboText });
        setTimeout(() => el.remove(), 500);
      }
      ui.updateHUD(state.getState().score, state.getState().lives, cfg.maxLives);
    } else {
      state.updateState({ consecutiveCorrect: 0 });
      el.classList.add("wrong");
      ui.showFeedback({ correct: false });
      if (cfg.wrongLoseLife && cfg.maxLives > 0) {
        state.updateState({ lives: s.lives - 1 });
        ui.updateHUD(state.getState().score, state.getState().lives, cfg.maxLives);
        if (state.getState().lives <= 0) endGame();
      }
      setTimeout(() => el.classList.remove("wrong"), 500);
    }
  }

  function endGame() {
    const s = state.getState();
    state.updateState({ isPlaying: false });
    if (s.nextTimeoutId) clearTimeout(s.nextTimeoutId);
    state.updateState({ nextTimeoutId: null });
    clearCurrentTargets();
    ui.showGameOver("Final score: " + s.score);
  }

  function playAgain() {
    const cfg = getCfg();
    state.updateState({
      score: 0,
      lives: cfg.maxLives === 0 ? 999 : cfg.maxLives,
      consecutiveCorrect: 0,
    });
    ui.hideGameOver();
    ui.updateHUD(state.getState().score, state.getState().lives, cfg.maxLives);
    ui.showStartScreen();
  }

  function backToMenu() {
    state.updateState({ isPlaying: false });
    const s = state.getState();
    if (s.nextTimeoutId) clearTimeout(s.nextTimeoutId);
    state.updateState({ nextTimeoutId: null });
    clearCurrentTargets();
    ui.showStartScreen();
    ui.updateHUD(s.score, s.lives, config.getDifficultyConfig(s.difficulty).maxLives);
  }

  function startGame() {
    const mode = ui.getSelectedMode();
    const difficulty = ui.getSelectedDifficulty();
    const delayBeforeNext = ui.getTimerValue();
    const cfg = config.getDifficultyConfig(difficulty);

    state.updateState({
      mode,
      difficulty,
      delayBeforeNext,
      lives: cfg.maxLives === 0 ? 999 : cfg.maxLives,
      consecutiveCorrect: 0,
      isPlaying: true,
    });
    ui.setBodyDifficulty(difficulty);
    ui.hideStartScreen();
    ui.updateHUD(state.getState().score, state.getState().lives, cfg.maxLives);
    createTargets();
  }

  function onCursorMove(x, y) {
    state.updateState({ cursorX: x, cursorY: y });
    ui.updateCursor(x, y);
  }

  return {
    startGame,
    shoot,
    onCursorMove,
    createTargets,
    playAgain,
    endGame,
    backToMenu,
  };
}
