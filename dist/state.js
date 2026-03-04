/**
 * State module (SRP: single source of truth for game state).
 * All reads/writes go through getState() and updateState() so future features (e.g. persistence, undo) can hook in one place.
 */
const initialState = () => ({
    mode: "letters",
    roundMode: "letters",
    difficulty: "medium",
    score: 0,
    lives: 3,
    targetItem: null,
    targets: [],
    correctHitCountThisRound: 0,
    isPlaying: false,
    cursorX: 0,
    cursorY: 0,
    delayBeforeNext: 1000,
    nextTimeoutId: null,
    consecutiveCorrect: 0,
});
let state = initialState();
export function getState() {
    return state;
}
export function updateState(updates) {
    state = { ...state, ...updates };
    return state;
}
