/**
 * Shared constants for game and UI. Single place for magic numbers and timings.
 * Design: minimum target screen is iPad. Do not add logic or trade performance
 * solely to support smaller devices.
 *
 * Minimum supported viewport (CSS pixels): 768 × 768
 * (iPad Mini portrait width; landscape height.)
 * Phones: iPhone 11 and newer are supported; smaller iPhones are not.
 */
export const GAME = {
    TARGET_PADDING_PX: 80,
    MAX_PLACEMENT_TRIES: 50,
    SHATTER_REMOVE_DELAY_MS: 500,
    WRONG_SHAKE_REMOVE_MS: 500,
};
export const UI = {
    POP_IN_REMOVE_MS: 350,
};
