/**
 * Config module (SRP: difficulty and global settings only).
 * maxLives 0 = infinite (no game over from wrong shots).
 */

export const DIFFICULTY = {
  easy: {
    targetsPerRound: 4,
    correctCountPerRound: 2,
    maxLives: 0,
    wrongLoseLife: false,
    correctPoints: 100,
    poolSize: "small",
    targetSize: "large",
    similarDistractors: false,
    comboBonus: false,
  },
  medium: {
    targetsPerRound: 6,
    correctCountPerRound: 3,
    maxLives: 3,
    wrongLoseLife: true,
    correctPoints: 100,
    poolSize: "full",
    targetSize: "medium",
    similarDistractors: false,
    comboBonus: false,
  },
  hard: {
    targetsPerRound: 9,
    correctCountPerRound: 4,
    maxLives: 3,
    wrongLoseLife: true,
    correctPoints: 100,
    poolSize: "full",
    targetSize: "small",
    similarDistractors: true,
    comboBonus: true,
  },
};

/**
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 */
export function getDifficultyConfig(difficulty) {
  return DIFFICULTY[difficulty] || DIFFICULTY.medium;
}
