
import { LetterTile } from './LetterTile';

interface WordRowProps {
  word: string;
  targetWord: string;
  isSubmitted: boolean;
  isCurrentRow: boolean;
}

export const WordRow = ({ word, targetWord, isSubmitted, isCurrentRow }: WordRowProps) => {
  const letters = Array.from({ length: 5 }, (_, index) => word[index] || '');
  
  const getLetterStatus = (letter: string, index: number) => {
    if (!isSubmitted) return 'empty';
    
    if (letter === targetWord[index]) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  return (
    <div className="grid grid-cols-5 gap-0">
      {letters.map((letter, index) => (
        <LetterTile
          key={index}
          letter={letter}
          status={getLetterStatus(letter, index)}
          isCurrentRow={isCurrentRow}
          delay={index * 100}
        />
      ))}
    </div>
  );
};
