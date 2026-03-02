/**
 * Shared types for Shoot & Learn. Single place for domain and dependency interfaces.
 */

export type GameMode = "letters" | "numbers" | "fruits" | "random";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface ContentItem {
  value: string | number;
  display: string;
  context?: string;
}

export interface DifficultyConfig {
  targetsPerRound: number;
  correctCountPerRound: number;
  maxLives: number;
  wrongLoseLife: boolean;
  correctPoints: number;
  poolSize: "small" | "full";
  targetSize: "large" | "medium" | "small";
  similarDistractors: boolean;
  comboBonus: boolean;
}

export interface GameState {
  mode: GameMode;
  roundMode: "letters" | "numbers" | "fruits";
  difficulty: DifficultyLevel;
  score: number;
  lives: number;
  targetItem: ContentItem | null;
  targets: Array<{ el: HTMLElement; item: ContentItem }>;
  correctHitCountThisRound: number;
  isPlaying: boolean;
  cursorX: number;
  cursorY: number;
  delayBeforeNext: number;
  nextTimeoutId: ReturnType<typeof setTimeout> | null;
  consecutiveCorrect: number;
}

export interface StateApi {
  getState: () => GameState;
  updateState: (updates: Partial<GameState>) => GameState;
}

export interface ConfigApi {
  getDifficultyConfig: (difficulty: DifficultyLevel) => DifficultyConfig;
}

export interface ContentApi {
  getPool: (mode: "letters" | "numbers" | "fruits", poolSize: "small" | "full") => ContentItem[];
  getSimilarDistractorPool: (
    mode: string,
    targetItem: ContentItem,
    pool: ContentItem[],
    useSimilar: boolean
  ) => ContentItem[] | null;
  getPromptLabel: (mode: string, item: ContentItem) => string;
  getRandomItem: <T>(arr: T[]) => T;
  shuffle: <T>(arr: T[]) => T[];
  getRandomContentMode: () => "letters" | "numbers" | "fruits";
}

export interface SoundsApi {
  playShootSound: () => void;
  playWrongHitSound: () => void;
  playReloadSound: () => void;
}

export interface FeedbackOptions {
  correct: boolean;
  context?: string | null;
  comboText?: string | null;
}

export interface UiApi {
  getPlayArea: () => HTMLElement | null;
  updateHUD: (score: number, lives: number, maxLives: number) => void;
  showFeedback: (options: FeedbackOptions) => void;
  setPrompt: (promptTextStr: string, targetDisplayStr: string) => void;
  updateCursor: (x: number, y: number) => void;
  hideStartScreen: () => void;
  showStartScreen: () => void;
  hideMenuButton: () => void;
  showMenuButton: () => void;
  showGameOver: (finalScoreMsg: string) => void;
  hideGameOver: () => void;
  getSelectedMode: () => GameMode;
  getSelectedDifficulty: () => DifficultyLevel;
  getTimerValue: () => number;
  setBodyDifficulty: (difficulty: DifficultyLevel) => void;
  createTargetElement: (item: ContentItem, sizeClass: string, left: number, top: number) => HTMLElement;
  appendToPlayArea: (element: HTMLElement) => void;
  clearTargets: (targets: Array<{ el: HTMLElement; item: ContentItem }>) => void;
  removeTarget: (el: HTMLElement | null) => void;
  markTargetWrong: (el: HTMLElement | null) => void;
  unmarkTargetWrongAfter: (el: HTMLElement | null, ms: number) => void;
  elementAt: (x: number, y: number) => Element | null;
  playShootCursorAnimation: () => void;
  shatterTarget: (targetEl: HTMLElement | null) => void;
  getTheme: () => "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  getStartButtonId: () => string;
  getPlayAgainButtonId: () => string;
  getMenuButtonId: () => string;
}
