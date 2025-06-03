
import { cn } from '@/lib/utils';

interface LetterTileProps {
  letter: string;
  status: 'correct' | 'present' | 'absent' | 'empty';
  isCurrentRow: boolean;
  delay: number;
}

export const LetterTile = ({ letter, status, isCurrentRow, delay }: LetterTileProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'correct':
        return 'bg-green-600 border-green-600 text-white';
      case 'present':
        return 'bg-yellow-600 border-yellow-600 text-white';
      case 'absent':
        return 'bg-slate-600 border-slate-600 text-white';
      default:
        return letter 
          ? 'bg-slate-700 border-slate-500 text-white' 
          : 'bg-slate-800 border-slate-600 text-transparent';
    }
  };

  return (
    <div
      className={cn(
        'w-14 h-14 border border-r-0 last:border-r flex items-center justify-center font-bold text-xl',
        'transition-all duration-300 transform',
        getStatusStyles(),
        isCurrentRow && letter && 'scale-105',
        status !== 'empty' && 'animate-scale-in'
      )}
      style={{ 
        animationDelay: status !== 'empty' ? `${delay}ms` : '0ms' 
      }}
    >
      {letter.toUpperCase()}
    </div>
  );
};
