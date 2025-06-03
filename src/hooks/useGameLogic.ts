
import { useState, useCallback, useEffect } from 'react';
import { getRandomWord, isValidWord } from '@/utils/wordList';

export const useGameLogic = () => {
  const [targetWord, setTargetWord] = useState(getRandomWord());
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [currentRow, setCurrentRow] = useState(0);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) return;
      if (!isValidWord(currentGuess)) return;

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      
      if (currentGuess === targetWord) {
        setGameStatus('won');
      } else if (newGuesses.length >= 6) {
        setGameStatus('lost');
      } else {
        setCurrentRow(currentRow + 1);
      }
      
      setCurrentGuess('');
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (key.length === 1 && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key.toLowerCase());
    }
  }, [currentGuess, guesses, targetWord, gameStatus, currentRow]);

  const resetGame = useCallback(() => {
    setTargetWord(getRandomWord());
    setCurrentGuess('');
    setGuesses([]);
    setGameStatus('playing');
    setCurrentRow(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return;
      
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  return {
    targetWord,
    currentGuess,
    guesses,
    gameStatus,
    currentRow,
    handleKeyPress,
    resetGame
  };
};
