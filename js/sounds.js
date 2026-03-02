/**
 * Sounds module (SRP: audio feedback only). Reusable across game and menu.
 */

const SOUNDS = {
  shoot: "sounds/shoot.mp3",
  shootAlt: "sounds/shoot-alt.mp3",
  wrongImpact: "sounds/wrong-impact.mp3",
  reload: "sounds/reload.mp3",
};

function play(name) {
  try {
    const src = SOUNDS[name];
    if (!src) return;
    const a = new Audio(src);
    a.volume = 0.5;
    a.play().catch(() => {});
  } catch (_) {}
}

export function playShootSound() {
  play(Math.random() < 0.5 ? "shoot" : "shootAlt");
}

export function playWrongHitSound() {
  play("wrongImpact");
}

export function playReloadSound() {
  play("reload");
}
