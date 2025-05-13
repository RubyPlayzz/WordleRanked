import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LETTER_STATES, type LetterState, type TileData } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get CSS classes for a tile based on its state
export function getTileStateClass(state: LetterState): string {
  switch (state) {
    case LETTER_STATES.CORRECT:
      return 'bg-correct text-white border-correct';
    case LETTER_STATES.PRESENT:
      return 'bg-present text-white border-present';
    case LETTER_STATES.ABSENT:
      return 'bg-absent text-white border-absent';
    case LETTER_STATES.FILLED:
      return 'border-gray-400 dark:border-gray-500';
    default:
      return 'border-gray-300 dark:border-gray-600';
  }
}

// Get CSS classes for a keyboard key based on its state
export function getKeyStateClass(state: LetterState): string {
  switch (state) {
    case LETTER_STATES.CORRECT:
      return 'bg-correct text-white';
    case LETTER_STATES.PRESENT:
      return 'bg-present text-white';
    case LETTER_STATES.ABSENT:
      return 'bg-absent text-white';
    default:
      return 'bg-keyboardLight dark:bg-keyboardDark';
  }
}

// Evaluate the guess against the correct word and return tile states
export function evaluateGuess(guess: string, correctWord: string): TileData[] {
  if (guess.length !== correctWord.length) {
    throw new Error('Guess must be the same length as the correct word');
  }
  
  const result: TileData[] = [];
  const guessArr = guess.toUpperCase().split('');
  const correctArr = correctWord.toUpperCase().split('');
  
  // First mark all correct positions
  const correctPositions = new Set<number>();
  const remainingCorrectLetters = [...correctArr];
  
  // First pass: Mark correct positions
  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === correctArr[i]) {
      result[i] = { letter: guessArr[i], state: LETTER_STATES.CORRECT };
      correctPositions.add(i);
      
      // Remove this letter from remaining correct letters
      const index = remainingCorrectLetters.indexOf(guessArr[i]);
      if (index !== -1) {
        remainingCorrectLetters.splice(index, 1);
      }
    }
  }
  
  // Second pass: Mark present or absent
  for (let i = 0; i < guessArr.length; i++) {
    if (correctPositions.has(i)) continue; // Skip already marked as correct
    
    const index = remainingCorrectLetters.indexOf(guessArr[i]);
    if (index !== -1) {
      // Letter exists elsewhere in the word
      result[i] = { letter: guessArr[i], state: LETTER_STATES.PRESENT };
      remainingCorrectLetters.splice(index, 1);
    } else {
      // Letter is not in the word or all instances already accounted for
      result[i] = { letter: guessArr[i], state: LETTER_STATES.ABSENT };
    }
  }
  
  return result;
}

// Format a countdown time from milliseconds to HH:MM:SS
export function formatCountdown(timeMs: number): string {
  if (timeMs <= 0) return '00:00:00';
  
  const totalSeconds = Math.floor(timeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}

// Generate an empty board state
export function generateEmptyBoard(rows: number, cols: number): TileData[][] {
  return Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({ letter: '', state: LETTER_STATES.EMPTY }))
  );
}

// Parse distribution string to array and calculate percentages
export function parseDistribution(distribution: string): { count: number, percentage: number }[] {
  const counts = distribution.split(',').map(count => parseInt(count));
  const total = counts.reduce((sum, count) => sum + count, 0);
  
  return counts.map(count => ({
    count,
    percentage: total > 0 ? Math.ceil((count / total) * 100) : 0
  }));
}

// Calculate time until next word (midnight)
export function getTimeUntilNextWord(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return tomorrow.getTime() - now.getTime();
}

// Safely get item from localStorage with proper typing
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  
  try {
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error parsing localStorage item ${key}:`, e);
    return defaultValue;
  }
}

// Safely set item to localStorage
export function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error setting localStorage item ${key}:`, e);
  }
}
