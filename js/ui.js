/**
 * UI module (SRP: all DOM and theme). Game logic never touches document directly.
 * DIP: game depends on this API, not on concrete DOM.
 */

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
  themeToggle: "theme-toggle",
  themeToggleStart: "theme-toggle-start",
  timerSelect: "timer-select",
  btnStart: "btn-start",
  btnPlayAgain: "btn-play-again",
  btnMenu: "btn-menu",
};

function el(id) {
  return document.getElementById(id);
}

export function getPlayArea() {
  return el(IDS.playArea);
}

export function updateHUD(score, lives, maxLives) {
  const scoreEl = el(IDS.score);
  const livesEl = el(IDS.lives);
  if (scoreEl) scoreEl.textContent = score;
  if (livesEl) {
    livesEl.textContent = maxLives === 0 ? "❤️ Unlimited" : "❤️".repeat(lives) + "🖤".repeat(maxLives - lives);
  }
}

export function showFeedback(options) {
  const { correct, context, comboText } = options;
  const feedbackEl = el(IDS.feedback);
  if (!feedbackEl) return;
  if (context || comboText) {
    feedbackEl.textContent = (context || "") + (comboText ? " " + comboText : "");
    feedbackEl.className = "feedback context";
  } else {
    feedbackEl.textContent = correct ? "Great job! 🎉" : "Oops! Wrong one. Try again!";
    feedbackEl.className = "feedback " + (correct ? "correct" : "wrong");
  }
  feedbackEl.classList.remove("hidden");
  const duration = context || comboText ? 2500 : 1200;
  setTimeout(() => feedbackEl.classList.add("hidden"), duration);
}

export function setPrompt(promptTextStr, targetDisplayStr) {
  const promptEl = el(IDS.promptText);
  const targetEl = el(IDS.targetDisplay);
  if (promptEl) promptEl.textContent = promptTextStr;
  if (targetEl) targetEl.textContent = targetDisplayStr;
}

export function updateCursor(x, y) {
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

export function hideStartScreen() {
  const start = el(IDS.startScreen);
  if (start) start.classList.add("hidden");
  showMenuButton();
}

export function showStartScreen() {
  const start = el(IDS.startScreen);
  if (start) start.classList.remove("hidden");
  hideMenuButton();
}

export function hideMenuButton() {
  const btn = el(IDS.btnMenu);
  if (btn) btn.classList.add("hidden");
}

export function showMenuButton() {
  const btn = el(IDS.btnMenu);
  if (btn) btn.classList.remove("hidden");
}

export function showGameOver(finalScoreMsg) {
  const overlay = el(IDS.gameOver);
  const msgEl = el(IDS.finalScoreMsg);
  if (msgEl) msgEl.textContent = finalScoreMsg;
  if (overlay) overlay.classList.remove("hidden");
}

export function hideGameOver() {
  const overlay = el(IDS.gameOver);
  if (overlay) overlay.classList.add("hidden");
}

export function getSelectedMode() {
  const btn = document.querySelector(".mode-buttons button.selected");
  return btn ? btn.dataset.mode : "letters";
}

export function getSelectedDifficulty() {
  const btn = document.querySelector(".difficulty-buttons button.selected");
  return btn ? btn.dataset.difficulty : "medium";
}

export function getTimerValue() {
  const select = el(IDS.timerSelect);
  return select ? parseInt(select.value, 10) : 1000;
}

export function setBodyDifficulty(difficulty) {
  document.body.setAttribute("data-difficulty", difficulty);
}

export function createTargetElement(item, sizeClass, left, top) {
  const el = document.createElement("div");
  el.className = "target pop-in " + sizeClass;
  el.dataset.value = String(item.value);
  el.textContent = item.display;
  el.style.left = left + "px";
  el.style.top = top + "px";
  setTimeout(() => el.classList.remove("pop-in"), 350);
  return el;
}

export function appendToPlayArea(element) {
  const area = getPlayArea();
  if (area) area.appendChild(element);
}

export function clearTargets(targets) {
  targets.forEach((t) => t.el && t.el.remove());
}

export function elementAt(x, y) {
  return document.elementFromPoint(x, y);
}

// --- Sounds (shoot / reload; drop your own files in sounds/) ---
const SOUNDS = {
  shoot: "sounds/shoot.mp3",
  shootAlt: "sounds/shoot-alt.mp3",
  wrongImpact: "sounds/wrong-impact.mp3",
  reload: "sounds/reload.mp3",
};

function playSound(name) {
  try {
    const src = SOUNDS[name];
    if (!src) return;
    const a = new Audio(src);
    a.volume = 0.5;
    a.play().catch(() => {});
  } catch (_) {}
}

/** Play a random shoot sound (main or alternate). */
export function playShootSound() {
  const key = Math.random() < 0.5 ? "shoot" : "shootAlt";
  playSound(key);
}

/** Play when shooting a wrong target. */
export function playWrongHitSound() {
  playSound("wrongImpact");
}

export function playReloadSound() {
  playSound("reload");
}

const SHOOT_CURSOR_CLASS = "shoot-cursor";
const SHOOT_CURSOR_DURATION_MS = 250;

/** Play cursor expand animation when shooting. */
export function playShootCursorAnimation() {
  const dot = el(IDS.cursorDot);
  const cross = el(IDS.crosshair);
  if (dot) dot.classList.add(SHOOT_CURSOR_CLASS);
  if (cross) cross.classList.add(SHOOT_CURSOR_CLASS);
  setTimeout(() => {
    if (dot) dot.classList.remove(SHOOT_CURSOR_CLASS);
    if (cross) cross.classList.remove(SHOOT_CURSOR_CLASS);
  }, SHOOT_CURSOR_DURATION_MS);
}

/** Shatter a target: burst + flying particles. */
export function shatterTarget(targetEl) {
  if (!targetEl || !targetEl.classList) return;
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

// --- Theme (view concern) ---
const THEME_KEY = "shoot-learn-theme";

export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "light";
  } catch (_) {
    return "light";
  }
}

export function setTheme(theme) {
  theme = theme === "dark" ? "dark" : "light";
  if (theme === "dark") document.body.setAttribute("data-theme", "dark");
  else document.body.removeAttribute("data-theme");
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (_) {}
  updateThemeButtonLabel(theme);
}

export function updateThemeButtonLabel(theme) {
  const isDark = theme === "dark";
  const label = isDark ? "Light" : "Dark";
  const title = isDark ? "Switch to light screen" : "Switch to dark screen (easier in dark room)";
  [IDS.themeToggle, IDS.themeToggleStart].forEach((id) => {
    const btn = el(id);
    if (btn) {
      btn.textContent = "🌓 " + label;
      btn.title = title;
    }
  });
}

/** For main.js: bind buttons that need ids */
export function getThemeToggleIds() {
  return [IDS.themeToggle, IDS.themeToggleStart];
}

export function getStartButtonId() {
  return IDS.btnStart;
}

export function getPlayAgainButtonId() {
  return IDS.btnPlayAgain;
}

export function getMenuButtonId() {
  return IDS.btnMenu;
}
