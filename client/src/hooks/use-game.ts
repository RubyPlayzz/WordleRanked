import { useState, useEffect, useCallback } from 'react';
import { LETTER_STATES, WORD_LENGTH, MAX_ATTEMPTS, LOCAL_STORAGE_KEYS, WIN_MESSAGES, LOSE_MESSAGE, type GameData, type TileData } from '@/lib/constants';
import { evaluateGuess, generateEmptyBoard, getLocalStorageItem, setLocalStorageItem } from '@/lib/utils';
import { isValidWord } from '@/lib/word-list';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type UseGameProps = {
  userId?: number;
};

export function useGame({ userId }: UseGameProps = {}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [pointsEarned, setPointsEarned] = useState<number>(0);

  // Initialize game state with empty board
  const [gameState, setGameState] = useState<GameData>({
    boardState: generateEmptyBoard(MAX_ATTEMPTS, WORD_LENGTH),
    currentRow: 0,
    currentGuess: '',
    keyboardState: {},
    gameStatus: 'playing',
    correctWord: '',
    message: '',
    showMessage: false
  });

  // Check if user has already played today
  const checkPlayedToday = useCallback(async () => {
    if (!userId) return false;
    
    try {
      const res = await fetch(`/api/played-today/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to check play status');
      }
      
      const data = await res.json();
      return data.playedToday;
    } catch (err) {
      console.error('Error checking played status:', err);
      return false;
    }
  }, [userId]);

  // Load or initialize game
  const initGame = useCallback(async () => {
    setLoading(true);
    
    try {
      // First check if user has already played today
      const playedToday = await checkPlayedToday();
      
      // If the user has already played, load from localStorage
      const savedState = getLocalStorageItem<GameData | null>(LOCAL_STORAGE_KEYS.GAME_STATE, null);
      
      // Fetch today's word
      const res = await fetch('/api/word');
      if (!res.ok) {
        throw new Error('Failed to fetch daily word');
      }
      
      const { word } = await res.json();
      const correctWord = word.toUpperCase();
      
      if (savedState && savedState.correctWord === correctWord) {
        // If saved state matches today's word, restore it
        setGameState(savedState);
        
        if (savedState.gameStatus !== 'playing') {
          setGameComplete(true);
        }
      } else {
        // Otherwise start a new game
        setGameState({
          boardState: generateEmptyBoard(MAX_ATTEMPTS, WORD_LENGTH),
          currentRow: 0,
          currentGuess: '',
          keyboardState: {},
          gameStatus: 'playing',
          correctWord,
          message: '',
          showMessage: false
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error initializing game:', err);
      setError('Failed to load the game. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [checkPlayedToday]);

  // Initialize game on component mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState.correctWord) {
      setLocalStorageItem(LOCAL_STORAGE_KEYS.GAME_STATE, gameState);
    }
  }, [gameState]);

  // Handle key press
  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing') return;
    
    setGameState(prev => {
      // If current guess is already at max length, don't add more letters
      if (prev.currentGuess.length >= WORD_LENGTH) {
        return prev;
      }
      
      const newGuess = prev.currentGuess + key.toUpperCase();
      
      // Update board state with the current guess
      const newBoardState = [...prev.boardState];
      for (let i = 0; i < newGuess.length; i++) {
        newBoardState[prev.currentRow][i] = {
          letter: newGuess[i],
          state: LETTER_STATES.FILLED
        };
      }
      
      return {
        ...prev,
        currentGuess: newGuess,
        boardState: newBoardState
      };
    });
  }, [gameState.gameStatus]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;
    
    setGameState(prev => {
      if (prev.currentGuess.length === 0) {
        return prev;
      }
      
      const newGuess = prev.currentGuess.slice(0, -1);
      const newBoardState = [...prev.boardState];
      
      // Update board state
      newBoardState[prev.currentRow] = [...prev.boardState[prev.currentRow]];
      newBoardState[prev.currentRow][newGuess.length] = {
        letter: '',
        state: LETTER_STATES.EMPTY
      };
      
      return {
        ...prev,
        currentGuess: newGuess,
        boardState: newBoardState
      };
    });
  }, [gameState.gameStatus]);

  // Submit game result to the server
  const submitGameResult = useCallback(async (success: boolean, attempts: number) => {
    if (!userId) return;
    
    try {
      const response = await apiRequest('POST', '/api/submit-game', {
        userId,
        word: gameState.correctWord,
        attempts: success ? attempts : null,
        success
      });
      
      const data = await response.json();
      setPointsEarned(data.pointsEarned || 0);
      return data;
    } catch (error) {
      console.error('Error submitting game result:', error);
      return null;
    }
  }, [userId, gameState.correctWord]);

  // Handle enter to submit a guess
  const handleEnter = useCallback(async () => {
    if (gameState.gameStatus !== 'playing') return;
    
    // Check if current guess is complete
    if (gameState.currentGuess.length !== WORD_LENGTH) {
      setGameState(prev => ({
        ...prev,
        message: 'Not enough letters',
        showMessage: true
      }));
      return;
    }
    
    // Perform basic client-side validation
    if (!isValidWord(gameState.currentGuess)) {
      // Trigger shake animation
      document.querySelector(`.game-board > div:nth-child(${gameState.currentRow + 1})`)?.classList.add('shake');
      setTimeout(() => {
        document.querySelector(`.game-board > div:nth-child(${gameState.currentRow + 1})`)?.classList.remove('shake');
      }, 500);
      
      setGameState(prev => ({
        ...prev,
        message: 'Word must contain only letters',
        showMessage: true
      }));
      return;
    }
    
    // Validate the word with the server (optional - we'll accept any 5-letter word)
    try {
      // We could add server validation here, but for now we'll accept any valid 5-letter word
      // const validation = await validateWord(gameState.currentGuess);
      // if (!validation.valid) {
      //   document.querySelector(`.game-board > div:nth-child(${gameState.currentRow + 1})`)?.classList.add('shake');
      //   setTimeout(() => {
      //     document.querySelector(`.game-board > div:nth-child(${gameState.currentRow + 1})`)?.classList.remove('shake');
      //   }, 500);
      //   
      //   setGameState(prev => ({
      //     ...prev,
      //     message: validation.message || 'Not in word list',
      //     showMessage: true
      //   }));
      //   return;
      // }
    } catch (error) {
      console.error("Error validating word:", error);
      // Continue even if validation fails
    }
    
    // Word is valid, evaluate the guess
    const evaluation = evaluateGuess(gameState.currentGuess, gameState.correctWord);
    
    // Update board state with evaluation results
    const newBoardState = [...gameState.boardState];
    newBoardState[gameState.currentRow] = evaluation;
    
    // Update keyboard state
    const newKeyboardState = { ...gameState.keyboardState };
    evaluation.forEach(({ letter, state }) => {
      // Only update if the new state is more informative
      if (state === LETTER_STATES.CORRECT || 
          (state === LETTER_STATES.PRESENT && newKeyboardState[letter] !== LETTER_STATES.CORRECT) ||
          (state === LETTER_STATES.ABSENT && !newKeyboardState[letter])) {
        newKeyboardState[letter] = state;
      }
    });
    
    // Check if guess is correct
    const isCorrect = gameState.currentGuess === gameState.correctWord;
    
    // Check if out of attempts
    const isLastAttempt = gameState.currentRow === MAX_ATTEMPTS - 1;
    
    // Update game status
    let newGameStatus: 'playing' | 'won' | 'lost' = 'playing';
    let newMessage = '';
    
    if (isCorrect) {
      newGameStatus = 'won';
      const messageIndex = Math.min(gameState.currentRow, WIN_MESSAGES.length - 1);
      newMessage = WIN_MESSAGES[messageIndex];
      
      // Submit game result
      submitGameResult(true, gameState.currentRow + 1).catch(console.error);
      setGameComplete(true);
    } else if (isLastAttempt) {
      newGameStatus = 'lost';
      newMessage = LOSE_MESSAGE;
      
      // Submit game result
      submitGameResult(false, MAX_ATTEMPTS).catch(console.error);
      setGameComplete(true);
    }
    
    setGameState(prev => ({
      ...prev,
      boardState: newBoardState,
      keyboardState: newKeyboardState,
      currentRow: prev.currentRow + 1,
      currentGuess: '',
      gameStatus: newGameStatus,
      message: newMessage,
      showMessage: newMessage !== ''
    }));
  }, [gameState, submitGameResult, setGameComplete]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.gameStatus !== 'playing') return;
    
    const key = e.key.toUpperCase();
    
    if (key === 'ENTER') {
      handleEnter();
    } else if (key === 'BACKSPACE') {
      handleBackspace();
    } else if (/^[A-Z]$/.test(key) && gameState.currentGuess.length < WORD_LENGTH) {
      handleKeyPress(key);
    }
  }, [gameState.gameStatus, gameState.currentGuess.length, handleEnter, handleBackspace, handleKeyPress]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Hide message after a delay
  useEffect(() => {
    if (gameState.showMessage) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showMessage: false
        }));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.showMessage]);

  // Reset message state when it's hidden
  useEffect(() => {
    if (!gameState.showMessage && gameState.message) {
      // Small delay to ensure the element is fully hidden before removing the message
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          message: ''
        }));
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.showMessage, gameState.message]);

  // Restart game (only for development, real game only allows one play per day)
  const restartGame = useCallback(async () => {
    await initGame();
    setGameComplete(false);
  }, [initGame]);

  return {
    gameState,
    loading,
    error,
    gameComplete,
    pointsEarned,
    handleKeyPress,
    handleBackspace,
    handleEnter,
    restartGame
  };
}
