export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

export const LETTER_STATES = {
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
  EMPTY: 'empty',
  FILLED: 'filled'
} as const;

export type LetterState = typeof LETTER_STATES[keyof typeof LETTER_STATES];

export interface TileData {
  letter: string;
  state: LetterState;
}

export interface GameData {
  boardState: TileData[][];
  currentRow: number;
  currentGuess: string;
  keyboardState: Record<string, LetterState>;
  gameStatus: 'playing' | 'won' | 'lost';
  correctWord: string;
  message: string;
  showMessage: boolean;
}

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export interface PlayerStats {
  id: number;
  userId: number;
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  score: number;
  distribution: string;
  lastPlayed?: Date;
  rank: string;
}

export const RANK_COLORS = {
  'Bronze': 'from-amber-600 to-amber-800',
  'Silver': 'from-gray-400 to-gray-600',
  'Gold': 'from-yellow-400 to-yellow-600',
  'Platinum': 'from-indigo-400 to-indigo-600',
  'Diamond': 'from-blue-500 to-purple-500',
  'Champion': 'from-emerald-400 to-emerald-700'
};

export const RANK_THRESHOLDS = {
  'Bronze': 0,
  'Silver': 500,
  'Gold': 1000,
  'Platinum': 1500,
  'Diamond': 2000,
  'Champion': 2500
};

export const WIN_MESSAGES = [
  'Genius!',
  'Magnificent!',
  'Impressive!',
  'Splendid!',
  'Great!',
  'Good job!'
];

export const LOSE_MESSAGE = 'Better luck next time!';

export const LOCAL_STORAGE_KEYS = {
  GAME_STATE: 'wordleRanked.gameState',
  GAME_STATS: 'wordleRanked.gameStats',
  THEME: 'wordleRanked.theme',
  USER: 'wordleRanked.user',
  AUTH_TOKEN: 'auth_token'
};
