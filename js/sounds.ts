/**
 * Sounds module (SRP: audio feedback only). Reusable across game and menu.
 */

const SOUNDS: Record<string, string> = {
  shoot: "sounds/shoot.mp3",
  shootAlt: "sounds/shoot-alt.mp3",
  wrongImpact: "sounds/wrong-impact.mp3",
  reload: "sounds/reload.mp3",
};

function play(name: string): void {
  try {
    const src = SOUNDS[name];
    if (!src) return;
    const a = new Audio(src);
    a.volume = 0.5;
    a.play().catch(() => {});
  } catch {
    // ignore
  }
}

export function playShootSound(): void {
  play(Math.random() < 0.5 ? "shoot" : "shootAlt");
}

export function playWrongHitSound(): void {
  play("wrongImpact");
}

export function playReloadSound(): void {
  play("reload");
}
