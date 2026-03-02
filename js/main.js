/**
 * Main entry (composition root). Wires state, config, content, ui, and game engine.
 * Only place that knows about all modules; add new features by extending modules and wiring here.
 */

import * as state from "./state.js";
import * as config from "./config.js";
import * as content from "./content.js";
import * as ui from "./ui.js";
import { createGameEngine } from "./game.js";

const engine = createGameEngine(
  { getState: state.getState, updateState: state.updateState },
  { getDifficultyConfig: config.getDifficultyConfig, CONFIG: config.CONFIG },
  content,
  ui
);

function init() {
  ui.setTheme(ui.getTheme());

  document.addEventListener("mousemove", (e) => engine.onCursorMove(e.clientX, e.clientY));

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      engine.shoot();
    }
  });

  // Click-to-shoot: use click position for hit test (play area only, so UI buttons don't trigger a shot)
  const playArea = document.getElementById("play-area");
  if (playArea) {
    playArea.addEventListener("click", (e) => {
      engine.onCursorMove(e.clientX, e.clientY);
      engine.shoot();
    });
  }

  document.querySelectorAll(".difficulty-buttons button").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.playShootSound();
      document.querySelectorAll(".difficulty-buttons button").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  document.querySelectorAll(".mode-buttons button").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.playShootSound();
      document.querySelectorAll(".mode-buttons button").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  ui.getThemeToggleIds().forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", () => {
      ui.playShootSound();
      ui.setTheme(ui.getTheme() === "dark" ? "light" : "dark");
    });
  });

  const startBtn = document.getElementById(ui.getStartButtonId());
  if (startBtn) startBtn.addEventListener("click", () => {
    ui.playShootSound();
    ui.playShootCursorAnimation();
    engine.startGame();
  });

  const playAgainBtn = document.getElementById(ui.getPlayAgainButtonId());
  if (playAgainBtn) playAgainBtn.addEventListener("click", engine.playAgain);

  const menuBtn = document.getElementById(ui.getMenuButtonId());
  if (menuBtn) menuBtn.addEventListener("click", () => {
    ui.playReloadSound();
    engine.backToMenu();
  });

  const s = state.getState();
  const cfg = config.getDifficultyConfig(s.difficulty);
  ui.updateHUD(s.score, s.lives, cfg.maxLives);
}

init();
