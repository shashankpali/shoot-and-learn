# Shoot & Learn

A simple, kid-friendly learning game: move the cursor over the right letter, number, or fruit and press **Space** to shoot. Inspired by light-gun games like Virtua Cop.

## For whom

**Ages 2 to adult.** Difficulty: **Easy (2+)**, **Medium**, **Hard (9+ / adult)** (preschool and early primary). The game uses big targets, one main action (aim + Space), gentle feedback, and optional context on hit (e.g. “A for Apple”) so it stays readable and non-frantic for that age. Colors are soft in both light and dark mode so it’s comfortable for long play and for playing in a dark room.

## Features

- **Letters** — Find and shoot the requested letter (A–Z). On hit: e.g. “A for Apple”.
- **Numbers** — Find and shoot the requested number (1–10). On hit: e.g. “Number 5 — Five”.
- **Fruits** — Find and shoot the requested fruit (emoji). On hit: e.g. “A for Apple”.
- **Light / Dark mode** — Toggle in the header or on the start screen. Dark mode uses soft darks so the screen doesn’t strain eyes or light up the room; choice is saved.
- **Difficulty** — Easy (2+), Medium, Hard (9+ / adult). **Timer** — “Time before next item” can be set to **No delay** (next item only when you hit), 0.5 s, 1 s, 2 s, or 3 s.

## How to run locally

1. **Build the project** (TypeScript → JavaScript):
   ```bash
   npm install
   npm run build
   ```
2. Start a local static server, for example:
   - **Python 3:** `python3 -m http.server 8000`
   - **Node (npx):** `npx serve .`
3. In your browser go to: `http://localhost:8000` (or the port your server uses).

The app loads `dist/main.js`; after changing any `.ts` file in `js/`, run `npm run build` again (or `npm run watch` to rebuild on save).

## Host for free with GitHub Pages

1. Create a new repository on GitHub (e.g. `shoot-and-learn`).
2. Push this project into it:
   ```bash
   cd "/Users/apple/Desktop/Project/kid game"
   git init
   git add .
   git commit -m "Shoot & Learn game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source**: choose **Deploy from branch**, branch **main**, folder **/ (root)**. Save.
4. **Important:** Run `npm run build`, then `git add -f dist` and commit, so the site can load `dist/main.js` (or use a GitHub Action to build on deploy).
5. After a minute or two, the game will be live at:  
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

**Stack:** TypeScript (`js/*.ts`) compiles to JavaScript in `dist/`. No backend required.
