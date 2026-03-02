# JS module layout (SOLID / scalable)

- **content.js** — Learning content only: letters, numbers, fruits, similar-distractors. Add new modes or items here; game logic stays unchanged.
- **config.js** — Difficulty presets and global settings. Add new difficulty levels here.
- **state.js** — Single source of truth for game state. All reads/writes go through `getState()` / `updateState()` so persistence or undo can hook in one place.
- **ui.js** — All DOM and theme. Game logic never touches `document`; it calls this API. Add new screens or widgets here.
- **game.js** — Core loop and rules only. Receives state, config, content, and ui (dependency injection). Add new rules or win conditions here.
- **main.js** — Composition root: wires modules and event listeners. Add new features by extending the right module and wiring in `main.js`.

Run via a local server (ES modules): `python3 -m http.server 8000` or `npx serve .`
