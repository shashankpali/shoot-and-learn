/**
 * Main entry (composition root). Wires state, config, content, ui, and game engine.
 * Only place that knows about all modules; add new features by extending modules and wiring here.
 */
import * as state from "./state.js";
import * as config from "./config.js";
import * as content from "./content.js";
import * as ui from "./ui.js";
import * as sounds from "./sounds.js";
import { createGameEngine } from "./game.js";
const engine = createGameEngine({ getState: state.getState, updateState: state.updateState }, { getDifficultyConfig: config.getDifficultyConfig }, content, ui, sounds);
function init() {
    ui.setTheme(ui.getTheme());
    function updateCursor(x, y) {
        engine.onCursorMove(x, y);
    }
    document.addEventListener("mousemove", (e) => updateCursor(e.clientX, e.clientY));
    document.addEventListener("pointermove", (e) => updateCursor(e.clientX, e.clientY));
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            engine.shoot();
        }
    });
    const playArea = document.getElementById("play-area");
    if (playArea) {
        playArea.addEventListener("click", (e) => {
            engine.onCursorMove(e.clientX, e.clientY);
            engine.shoot();
        });
    }
    function bindOptionButtons(selector, onSelect) {
        document.querySelectorAll(selector).forEach((btn) => {
            btn.addEventListener("click", () => {
                sounds.playShootSound();
                btn.parentElement?.querySelectorAll("button").forEach((b) => b.classList.remove("selected"));
                btn.classList.add("selected");
                onSelect?.(btn);
            });
        });
    }
    bindOptionButtons(".difficulty-buttons button");
    bindOptionButtons(".mode-buttons button");
    document.querySelectorAll(".theme-buttons [data-theme]").forEach((btn) => {
        btn.addEventListener("click", () => {
            sounds.playShootSound();
            ui.setTheme(btn.dataset.theme ?? "dark");
        });
    });
    const startBtn = document.getElementById(ui.getStartButtonId());
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            sounds.playShootSound();
            ui.playShootCursorAnimation();
            engine.startGame();
        });
    }
    const playAgainBtn = document.getElementById(ui.getPlayAgainButtonId());
    if (playAgainBtn)
        playAgainBtn.addEventListener("click", engine.playAgain);
    const menuBtn = document.getElementById(ui.getMenuButtonId());
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            sounds.playReloadSound();
            engine.backToMenu();
        });
    }
    const s = state.getState();
    const cfg = config.getDifficultyConfig(s.difficulty);
    ui.updateHUD(s.score, s.lives, cfg.maxLives);
}
init();
