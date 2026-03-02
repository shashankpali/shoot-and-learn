/**
 * Shared constants for game and UI. Single place for magic numbers and timings.
 */

export const GAME = {
  TARGET_PADDING_PX: 80,
  MAX_PLACEMENT_TRIES: 50,
  SHATTER_REMOVE_DELAY_MS: 500,
  WRONG_SHAKE_REMOVE_MS: 500,
} as const;

export const UI = {
  POP_IN_REMOVE_MS: 350,
} as const;
