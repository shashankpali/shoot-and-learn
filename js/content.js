/**
 * Content module (SRP: learning content only).
 * Letters, numbers, fruits and helpers. Add new modes/items here without touching game logic.
 */

const LETTER_ITEMS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
  const words = {
    A: "Apple", B: "Ball", C: "Cat", D: "Dog", E: "Elephant", F: "Fish",
    G: "Grapes", H: "House", I: "Ice", J: "Jam", K: "Kite", L: "Lion",
    M: "Moon", N: "Nest", O: "Orange", P: "Penguin", Q: "Queen", R: "Rainbow",
    S: "Sun", T: "Tree", U: "Umbrella", V: "Violin", W: "Water", X: "X-ray",
    Y: "Yoyo", Z: "Zebra",
  };
  return {
    value: letter,
    display: letter,
    context: letter + " for " + (words[letter] || letter),
  };
});

const NUMBER_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  return {
    value: n,
    display: String(n),
    context: "Number " + n + " — " + words[n],
  };
});

const FRUIT_ITEMS = [
  { name: "Apple", emoji: "🍎", letter: "A" },
  { name: "Banana", emoji: "🍌", letter: "B" },
  { name: "Cherry", emoji: "🍒", letter: "C" },
  { name: "Grape", emoji: "🍇", letter: "G" },
  { name: "Lemon", emoji: "🍋", letter: "L" },
  { name: "Orange", emoji: "🍊", letter: "O" },
  { name: "Peach", emoji: "🍑", letter: "P" },
  { name: "Pear", emoji: "🍐", letter: "P" },
  { name: "Strawberry", emoji: "🍓", letter: "S" },
  { name: "Watermelon", emoji: "🍉", letter: "W" },
].map((f) => ({
  value: f.name,
  display: f.emoji,
  context: f.letter + " for " + f.name,
}));

export const CONTENT_MODES = {
  letters: { label: "Letters", items: LETTER_ITEMS },
  numbers: { label: "Numbers", items: NUMBER_ITEMS },
  fruits: { label: "Fruits", items: FRUIT_ITEMS },
  random: { label: "Random", items: [] },
};

const RANDOM_CONTENT_MODES = ["letters", "numbers", "fruits"];

/** For Random mode: pick letters, numbers, or fruits for this round. */
export function getRandomContentMode() {
  return RANDOM_CONTENT_MODES[Math.floor(Math.random() * RANDOM_CONTENT_MODES.length)];
}

const SIMILAR_LETTERS = {
  A: "AHRK", B: "BDPRE", C: "COQG", D: "DBPO", E: "EFB", F: "FEP", G: "GOQC",
  H: "HANKM", I: "IJL1", J: "JIG", K: "KAXH", L: "LI", M: "MNWH", N: "NMWH",
  O: "OQC0", P: "PBRD", Q: "QOGC", R: "RBPK", S: "S5", T: "TY", U: "UV",
  V: "VUY", W: "WMN", X: "XK", Y: "YVT", Z: "Z2",
};
const SIMILAR_NUMBERS = { 1: [7], 7: [1], 6: [9], 9: [6], 3: [8], 8: [3], 4: [9], 5: [6] };

export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {string} mode - 'letters' | 'numbers' | 'fruits'
 * @param {'small'|'full'} poolSize
 */
export function getPool(mode, poolSize) {
  const content = CONTENT_MODES[mode];
  if (!content) return [];
  let items = [...content.items];
  if (poolSize === "small") {
    if (mode === "letters") items = items.slice(0, 8);
    else if (mode === "numbers") items = items.slice(0, 5);
    else items = items.slice(0, 6);
  }
  return items;
}

/**
 * @param {string} mode
 * @param {object} targetItem
 * @param {Array} pool - result of getPool()
 * @param {boolean} useSimilar
 */
export function getSimilarDistractorPool(mode, targetItem, pool, useSimilar) {
  if (!useSimilar) return null;
  const v = targetItem.value;
  if (mode === "letters" && SIMILAR_LETTERS[v]) {
    const chars = SIMILAR_LETTERS[v].split("").filter((c) => c !== v);
    return pool.filter((item) => item.value !== v && chars.includes(item.value));
  }
  if (mode === "numbers" && SIMILAR_NUMBERS[v]) {
    const nums = SIMILAR_NUMBERS[v];
    return pool.filter((item) => item.value !== v && nums.includes(Number(item.value)));
  }
  return null;
}

export function getPromptLabel(mode, item) {
  if (mode === "letters") return "Shoot the letter " + item.display + "!";
  if (mode === "numbers") return "Shoot the number " + item.display + "!";
  return "Shoot the " + item.value + "!";
}
