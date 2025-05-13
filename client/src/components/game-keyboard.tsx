import { KEYBOARD_ROWS, type LetterState } from "@/lib/constants";
import { getKeyStateClass } from "@/lib/utils";
import { Delete } from "lucide-react";

interface GameKeyboardProps {
  keyboardState: Record<string, LetterState>;
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

export function GameKeyboard({ 
  keyboardState, 
  onKeyPress, 
  onEnter, 
  onBackspace 
}: GameKeyboardProps) {
  return (
    <div className="keyboard mb-2">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div 
          key={rowIndex}
          className={`flex justify-center mb-2 ${rowIndex === 1 ? 'ml-2 md:ml-6' : ''}`}
        >
          {row.map((key) => {
            if (key === 'ENTER') {
              return (
                <button
                  key={key}
                  className="keyboard-key bg-keyboardLight dark:bg-keyboardDark px-2 py-4 text-xs sm:text-sm min-w-[60px] sm:min-w-[65px] mr-1"
                  onClick={() => onEnter()}
                >
                  ENTER
                </button>
              );
            }
            
            if (key === 'BACKSPACE') {
              return (
                <button
                  key={key}
                  className="keyboard-key bg-keyboardLight dark:bg-keyboardDark px-2 py-4 text-sm sm:text-base min-w-[60px] sm:min-w-[65px]"
                  onClick={() => onBackspace()}
                >
                  <Delete className="h-6 w-6" />
                </button>
              );
            }
            
            return (
              <button
                key={key}
                className={`keyboard-key px-1 sm:px-2 py-4 text-sm sm:text-base min-w-[30px] sm:min-w-[40px] mr-1 ${getKeyStateClass(keyboardState[key] || '')}`}
                onClick={() => onKeyPress(key)}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
