/**
 * UI module (SRP: all DOM and theme). Game logic never touches document directly.
 * DIP: game depends on this API, not on concrete DOM.
 */

import { UI as UI_CONSTANTS } from "./constants.js";
import type { ContentItem, DifficultyLevel, FeedbackOptions, GameMode } from "./types.js";

const IDS = {
  playArea: "play-area",
  promptText: "prompt-text",
  targetDisplay: "target-display",
  score: "score",
  lives: "lives",
  feedback: "feedback",
  startScreen: "start-screen",
  gameOver: "game-over",
  finalScoreMsg: "final-score-msg",
  cursorDot: "cursor-dot",
  crosshair: "crosshair",
  timerSelect: "timer-select",
  btnStart: "btn-start",
  btnPlayAgain: "btn-play-again",
  btnMenu: "btn-menu",
} as const;

function el(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function getPlayArea(): HTMLElement | null {
  return el(IDS.playArea);
}

export function updateHUD(score: number, lives: number, maxLives: number): void {
  const scoreEl = el(IDS.score);
  const livesEl = el(IDS.lives);
  if (scoreEl) scoreEl.textContent = String(score);
  if (livesEl) {
    livesEl.textContent = maxLives === 0 ? "❤️ Unlimited" : "❤️".repeat(lives) + "🖤".repeat(maxLives - lives);
  }
}

export function showFeedback(options: FeedbackOptions): void {
  const { correct, context, comboText } = options;
  const feedbackEl = el(IDS.feedback);
  if (!feedbackEl) return;
  if (context ?? comboText) {
    feedbackEl.textContent = (context ?? "") + (comboText ? " " + comboText : "");
    feedbackEl.className = "feedback context";
  } else {
    feedbackEl.textContent = correct ? "Great job! 🎉" : "Oops! Wrong one. Try again!";
    feedbackEl.className = "feedback " + (correct ? "correct" : "wrong");
  }
  feedbackEl.classList.remove("hidden");
  const duration = context ?? comboText ? 2500 : 1200;
  setTimeout(() => feedbackEl.classList.add("hidden"), duration);
}

export function setPrompt(promptTextStr: string, targetDisplayStr: string): void {
  const promptEl = el(IDS.promptText);
  const targetEl = el(IDS.targetDisplay);
  if (promptEl) promptEl.textContent = promptTextStr;
  if (targetEl) targetEl.textContent = targetDisplayStr;
}

export function updateCursor(x: number, y: number): void {
  const dot = el(IDS.cursorDot);
  const cross = el(IDS.crosshair);
  if (dot) {
    dot.style.left = x + "px";
    dot.style.top = y + "px";
  }
  if (cross) {
    cross.style.left = x + "px";
    cross.style.top = y + "px";
  }
}

export function hideStartScreen(): void {
  const start = el(IDS.startScreen);
  if (start) start.classList.add("hidden");
  showMenuButton();
}

export function showStartScreen(): void {
  const start = el(IDS.startScreen);
  if (start) start.classList.remove("hidden");
  hideMenuButton();
}

export function hideMenuButton(): void {
  const btn = el(IDS.btnMenu);
  if (btn) btn.classList.add("hidden");
}

export function showMenuButton(): void {
  const btn = el(IDS.btnMenu);
  if (btn) btn.classList.remove("hidden");
}

export function showGameOver(finalScoreMsg: string): void {
  const overlay = el(IDS.gameOver);
  const msgEl = el(IDS.finalScoreMsg);
  if (msgEl) msgEl.textContent = finalScoreMsg;
  if (overlay) overlay.classList.remove("hidden");
}

export function hideGameOver(): void {
  const overlay = el(IDS.gameOver);
  if (overlay) overlay.classList.add("hidden");
}

export function getSelectedMode(): GameMode {
  const btn = document.querySelector(".mode-buttons button.selected");
  const mode = (btn as HTMLElement | null)?.dataset?.mode;
  return (mode as GameMode) ?? "letters";
}

export function getSelectedDifficulty(): DifficultyLevel {
  const btn = document.querySelector(".difficulty-buttons button.selected");
  const difficulty = (btn as HTMLElement | null)?.dataset?.difficulty;
  return (difficulty as DifficultyLevel) ?? "medium";
}

export function getTimerValue(): number {
  const select = el(IDS.timerSelect) as HTMLSelectElement | null;
  return select ? parseInt(select.value, 10) : 1000;
}

export function setBodyDifficulty(difficulty: DifficultyLevel): void {
  document.body.setAttribute("data-difficulty", difficulty);
}

export function createTargetElement(item: ContentItem, sizeClass: string, left: number, top: number): HTMLElement {
  const el = document.createElement("div");
  el.className = "target pop-in " + sizeClass;
  el.dataset.value = String(item.value);
  el.textContent = item.display;
  el.style.left = left + "px";
  el.style.top = top + "px";
  setTimeout(() => el.classList.remove("pop-in"), UI_CONSTANTS.POP_IN_REMOVE_MS);
  return el;
}

export function appendToPlayArea(element: HTMLElement): void {
  const area = getPlayArea();
  if (area) area.appendChild(element);
}

export function clearTargets(targets: Array<{ el: HTMLElement; item: ContentItem }>): void {
  targets.forEach((t) => t.el?.remove());
}

export function removeTarget(el: HTMLElement | null): void {
  el?.remove();
}

export function markTargetWrong(el: HTMLElement | null): void {
  el?.classList?.add("wrong");
}

export function unmarkTargetWrongAfter(el: HTMLElement | null, ms: number): void {
  if (!el) return;
  setTimeout(() => el.classList?.remove("wrong"), ms);
}

export function elementAt(x: number, y: number): Element | null {
  return document.elementFromPoint(x, y);
}

const SHOOT_CURSOR_CLASS = "shoot-cursor";
const SHOOT_CURSOR_DURATION_MS = 250;

export function playShootCursorAnimation(): void {
  const dot = el(IDS.cursorDot);
  const cross = el(IDS.crosshair);
  if (dot) dot.classList.add(SHOOT_CURSOR_CLASS);
  if (cross) cross.classList.add(SHOOT_CURSOR_CLASS);
  setTimeout(() => {
    dot?.classList.remove(SHOOT_CURSOR_CLASS);
    cross?.classList.remove(SHOOT_CURSOR_CLASS);
  }, SHOOT_CURSOR_DURATION_MS);
}

export function shatterTarget(targetEl: HTMLElement | null): void {
  if (!targetEl?.classList) return;
  targetEl.classList.add("shatter");
  targetEl.classList.remove("correct");

  const count = 8;
  const radius = 70;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    const p = document.createElement("div");
    p.className = "shatter-particle";
    p.style.setProperty("--dx", dx + "px");
    p.style.setProperty("--dy", dy + "px");
    targetEl.appendChild(p);
  }
}

const THEME_KEY = "shoot-learn-theme";

export function getTheme(): "light" | "dark" {
  try {
    return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "dark";
  } catch {
    return "light";
  }
}

export function setTheme(theme: string): void {
  const normalized: "light" | "dark" = theme === "dark" ? "dark" : "light";
  if (normalized === "dark") document.body.setAttribute("data-theme", "dark");
  else document.body.removeAttribute("data-theme");
  try {
    localStorage.setItem(THEME_KEY, normalized);
  } catch {
    // ignore
  }
  updateThemeButtons(normalized);
}

export function updateThemeButtons(theme: "light" | "dark"): void {
  const active = theme === "dark" ? "dark" : "light";
  document.querySelectorAll<HTMLElement>(".theme-buttons [data-theme]").forEach((btn) => {
    const isActive = btn.dataset.theme === active;
    btn.classList.toggle("selected", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

export function getStartButtonId(): string {
  return IDS.btnStart;
}

export function getPlayAgainButtonId(): string {
  return IDS.btnPlayAgain;
}

export function getMenuButtonId(): string {
  return IDS.btnMenu;
}
