
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getRankInfo } from '@/utils/rankSystem';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  gameStatus: 'won' | 'lost' | 'playing';
  targetWord: string;
  guessCount: number;
  ratingChange: number;
  newRating: number;
  newRank: string;
  onNewGame: () => void;
}

export const GameOverModal = ({
  isOpen,
  gameStatus,
  targetWord,
  guessCount,
  ratingChange,
  newRating,
  newRank,
  onNewGame
}: GameOverModalProps) => {
  const rankInfo = getRankInfo(newRank);
  const won = gameStatus === 'won';

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {won ? '🎉 Victory!' : '💔 Game Over'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-slate-300 mb-2">The word was:</p>
            <p className="text-3xl font-bold text-yellow-400">{targetWord.toUpperCase()}</p>
            {won && (
              <p className="text-slate-400 mt-2">Solved in {guessCount} guess{guessCount !== 1 ? 'es' : ''}!</p>
            )}
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Rating Change:</span>
              <div className="flex items-center gap-2">
                {ratingChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={ratingChange > 0 ? 'text-green-400' : 'text-red-400'}>
                  {ratingChange > 0 ? '+' : ''}{ratingChange}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-300">New Rating:</span>
              <span className="font-semibold">{newRating}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${rankInfo.gradient}`}>
                {rankInfo.icon}
              </div>
              <div>
                <p className="font-semibold">{newRank}</p>
                <p className="text-xs text-slate-400">{rankInfo.description}</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={onNewGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Trophy className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
