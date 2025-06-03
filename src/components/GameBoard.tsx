
import { WordRow } from './WordRow';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  currentRow: number;
  targetWord: string;
  gameStatus: 'playing' | 'won' | 'lost';
}

export const GameBoard = ({ 
  guesses, 
  currentGuess, 
  currentRow, 
  targetWord, 
  gameStatus 
}: GameBoardProps) => {
  const rows = Array.from({ length: 6 }, (_, index) => {
    if (index < guesses.length) {
      return guesses[index];
    } else if (index === currentRow && gameStatus === 'playing') {
      return currentGuess;
    }
    return '';
  });

  return (
    <div className="flex justify-center mb-6">
      <div className="grid gap-0">
        {rows.map((word, index) => (
          <WordRow
            key={index}
            word={word}
            targetWord={targetWord}
            isSubmitted={index < guesses.length}
            isCurrentRow={index === currentRow && gameStatus === 'playing'}
          />
        ))}
      </div>
    </div>
  );
};
