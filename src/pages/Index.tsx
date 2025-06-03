
import { useState, useEffect } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { Keyboard } from '@/components/Keyboard';
import { Header } from '@/components/Header';
import { GameOverModal } from '@/components/GameOverModal';
import { RankDisplay } from '@/components/RankDisplay';
import { useGameLogic } from '@/hooks/useGameLogic';
import { usePlayerStats } from '@/hooks/usePlayerStats';

const Index = () => {
  const {
    currentGuess,
    guesses,
    gameStatus,
    targetWord,
    currentRow,
    handleKeyPress,
    resetGame
  } = useGameLogic();

  const {
    playerStats,
    updateStats,
    getCurrentRank
  } = usePlayerStats();

  const [showGameOver, setShowGameOver] = useState(false);
  const [ratingChange, setRatingChange] = useState(0);

  useEffect(() => {
    if (gameStatus !== 'playing') {
      const won = gameStatus === 'won';
      const guessCount = currentRow + (won ? 1 : 0);
      const change = updateStats(won, guessCount);
      setRatingChange(change);
      setShowGameOver(true);
    }
  }, [gameStatus]);

  const handleNewGame = () => {
    setShowGameOver(false);
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Header />
        
        <div className="mb-6">
          <RankDisplay 
            rating={playerStats.rating}
            rank={getCurrentRank()}
          />
        </div>

        <div className="mb-6">
          <GameBoard 
            guesses={guesses}
            currentGuess={currentGuess}
            currentRow={currentRow}
            targetWord={targetWord}
            gameStatus={gameStatus}
          />
        </div>

        <Keyboard 
          onKeyPress={handleKeyPress}
          guesses={guesses}
          targetWord={targetWord}
          disabled={gameStatus !== 'playing'}
        />

        <GameOverModal
          isOpen={showGameOver}
          gameStatus={gameStatus}
          targetWord={targetWord}
          guessCount={currentRow + (gameStatus === 'won' ? 1 : 0)}
          ratingChange={ratingChange}
          newRating={playerStats.rating}
          newRank={getCurrentRank()}
          onNewGame={handleNewGame}
        />
      </div>
    </div>
  );
};

export default Index;
