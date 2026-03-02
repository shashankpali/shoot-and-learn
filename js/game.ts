/**
 * Game engine (SRP: core loop and rules only). No DOM, no content data.
 * Depends on injected state, config, content, ui, sounds (DIP). Add new rules or modes without touching UI/content.
 */

import { GAME } from "./constants.js";
import type { ConfigApi, ContentApi, SoundsApi, StateApi, UiApi } from "./types.js";

function isOverlapping(
  x: number,
  y: number,
  used: Array<{ x: number; y: number; w: number; h: number }>,
  w: number,
  h: number
): boolean {
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

export function createGameEngine(
  state: StateApi,
  config: ConfigApi,
  content: ContentApi,
  ui: UiApi,
  sounds: SoundsApi
) {
  function getCfg() {
    return config.getDifficultyConfig(state.getState().difficulty);
  }

  function createTargets(): void {
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
    const choices: typeof pool = [];
    for (let i = 0; i < correctCount; i++) choices.push(targetItem);
    const count = cfg.targetsPerRound;

    while (choices.length < count) {
      let item: (typeof pool)[number];
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
    const padding = GAME.TARGET_PADDING_PX;
    const sizeClass = "target-size-" + (cfg.targetSize || "medium");
    const w = cfg.targetSize === "large" ? 96 : cfg.targetSize === "small" ? 52 : 80;
    const h = cfg.targetSize === "large" ? 72 : cfg.targetSize === "small" ? 48 : 60;

    const targets: Array<{ el: HTMLElement; item: (typeof pool)[number] }> = [];
    const used: Array<{ x: number; y: number; w: number; h: number }> = [];

    shuffled.forEach((item) => {
      let x: number, y: number;
      let tries = 0;
      do {
        x = padding + Math.random() * (areaRect.width - padding * 2 - w);
        y = padding + Math.random() * (areaRect.height - padding * 2 - h);
        tries++;
      } while (isOverlapping(x, y, used, w, h) && tries < GAME.MAX_PLACEMENT_TRIES);
      used.push({ x, y, w, h });

      const el = ui.createTargetElement(item, sizeClass, x, y);
      ui.appendToPlayArea(el);
      targets.push({ el, item });
    });

    state.updateState({ targets });
    ui.setPrompt(content.getPromptLabel(roundMode, targetItem), targetItem.display);
  }

  function scheduleNextTargets(): void {
    const s = state.getState();
    const delay = Math.max(0, s.delayBeforeNext);
    const id = setTimeout(() => {
      state.updateState({ nextTimeoutId: null });
      sounds.playReloadSound();
      createTargets();
    }, delay);
    state.updateState({ nextTimeoutId: id });
  }

  function clearCurrentTargets(): void {
    const s = state.getState();
    ui.clearTargets(s.targets);
    state.updateState({ targets: [] });
  }

  function hitTarget(el: Element | null): el is HTMLElement {
    return !!el?.classList?.contains("target");
  }

  function getTargetRecord(el: HTMLElement) {
    const value = el?.dataset?.value;
    const targets = state.getState().targets;
    return targets.find((t) => String(t.item.value) === value);
  }

  function shoot(): void {
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

    const targetEl = el as HTMLElement;
    const correct = state.getState().targetItem && String(state.getState().targetItem!.value) === targetEl.dataset.value;

    if (correct) {
      sounds.playShootSound();
      const next = state.getState();
      const streak = next.consecutiveCorrect + 1;
      let points = cfg.correctPoints;
      if (cfg.comboBonus && streak > 1) points += (streak - 1) * 25;

      const record = getTargetRecord(targetEl);
      const context = record?.item.context ?? null;
      const comboText = cfg.comboBonus && streak > 1 ? " " + streak + "× combo!" : null;

      const correctCountPerRound = Math.max(1, cfg.correctCountPerRound ?? 1);
      const newCorrectHitCount = next.correctHitCountThisRound + 1;

      state.updateState({
        score: next.score + points,
        consecutiveCorrect: streak,
        correctHitCountThisRound: newCorrectHitCount,
        targets: next.targets.filter((t) => t.el !== targetEl),
      });
      ui.shatterTarget(targetEl);

      if (newCorrectHitCount >= correctCountPerRound) {
        ui.showFeedback({ correct: true, context, comboText });
        setTimeout(() => {
          ui.removeTarget(targetEl);
          clearCurrentTargets();
          scheduleNextTargets();
        }, GAME.SHATTER_REMOVE_DELAY_MS);
      } else {
        const remaining = correctCountPerRound - newCorrectHitCount;
        ui.showFeedback({ correct: true, context: null, comboText: remaining > 0 ? remaining + " more!" : comboText });
        setTimeout(() => ui.removeTarget(targetEl), GAME.SHATTER_REMOVE_DELAY_MS);
      }
      ui.updateHUD(state.getState().score, state.getState().lives, cfg.maxLives);
    } else {
      sounds.playWrongHitSound();
      state.updateState({ consecutiveCorrect: 0 });
      ui.markTargetWrong(targetEl);
      ui.showFeedback({ correct: false });
      if (cfg.wrongLoseLife && cfg.maxLives > 0) {
        state.updateState({ lives: s.lives - 1 });
        ui.updateHUD(state.getState().score, state.getState().lives, cfg.maxLives);
        if (state.getState().lives <= 0) endGame();
      }
      ui.unmarkTargetWrongAfter(targetEl, GAME.WRONG_SHAKE_REMOVE_MS);
    }
  }

  function endGame(): void {
    const s = state.getState();
    state.updateState({ isPlaying: false });
    if (s.nextTimeoutId) clearTimeout(s.nextTimeoutId);
    state.updateState({ nextTimeoutId: null });
    clearCurrentTargets();
    ui.showGameOver("Final score: " + s.score);
  }

  function playAgain(): void {
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

  function backToMenu(): void {
    state.updateState({ isPlaying: false });
    const s = state.getState();
    if (s.nextTimeoutId) clearTimeout(s.nextTimeoutId);
    state.updateState({ nextTimeoutId: null });
    clearCurrentTargets();
    ui.showStartScreen();
    ui.updateHUD(s.score, s.lives, config.getDifficultyConfig(s.difficulty).maxLives);
  }

  function startGame(): void {
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

  function onCursorMove(x: number, y: number): void {
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
