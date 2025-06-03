
import { cn } from '@/lib/utils';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  guesses: string[];
  targetWord: string;
  disabled: boolean;
}

export const Keyboard = ({ onKeyPress, guesses, targetWord, disabled }: KeyboardProps) => {
  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const getKeyStatus = (key: string) => {
    let status = 'unused';
    
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key.toLowerCase()) {
          if (targetWord[i] === key.toLowerCase()) {
            return 'correct';
          } else if (targetWord.includes(key.toLowerCase())) {
            status = 'present';
          } else if (status === 'unused') {
            status = 'absent';
          }
        }
      }
    }
    
    return status;
  };

  const getKeyStyles = (status: string) => {
    switch (status) {
      case 'correct':
        return 'bg-green-600 text-white border-green-600';
      case 'present':
        return 'bg-yellow-600 text-white border-yellow-600';
      case 'absent':
        return 'bg-slate-600 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600';
    }
  };

  const Key = ({ children, onClick, className = "" }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-12 rounded-lg border-2 font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95',
        className
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-1 justify-center">
        {topRow.map((key) => (
          <Key
            key={key}
            onClick={() => onKeyPress(key)}
            className={cn('px-3', getKeyStyles(getKeyStatus(key)))}
          >
            {key}
          </Key>
        ))}
      </div>
      
      <div className="flex gap-1 justify-center">
        {middleRow.map((key) => (
          <Key
            key={key}
            onClick={() => onKeyPress(key)}
            className={cn('px-3', getKeyStyles(getKeyStatus(key)))}
          >
            {key}
          </Key>
        ))}
      </div>
      
      <div className="flex gap-1 justify-center">
        <Key
          onClick={() => onKeyPress('ENTER')}
          className="px-4 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
        >
          ENTER
        </Key>
        {bottomRow.map((key) => (
          <Key
            key={key}
            onClick={() => onKeyPress(key)}
            className={cn('px-3', getKeyStyles(getKeyStatus(key)))}
          >
            {key}
          </Key>
        ))}
        <Key
          onClick={() => onKeyPress('BACKSPACE')}
          className="px-4 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
        >
          ⌫
        </Key>
      </div>
    </div>
  );
};
