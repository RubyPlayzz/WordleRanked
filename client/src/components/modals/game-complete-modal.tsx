import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCountdown } from "@/lib/utils";
import { useState, useEffect } from "react";
import { RANK_COLORS } from "@/lib/constants";

interface GameCompleteModalProps {
  open: boolean;
  onShareResults: () => void;
  onViewStats: () => void;
  gameWon: boolean;
  attempts: number;
  word: string;
  pointsEarned: number;
  rank: string;
}

export function GameCompleteModal({
  open,
  onShareResults,
  onViewStats,
  gameWon,
  attempts,
  word,
  pointsEarned,
  rank
}: GameCompleteModalProps) {
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState<number>(0);
  
  // Calculate and update time until tomorrow
  useEffect(() => {
    const calculateTimeUntilTomorrow = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime() - now.getTime();
    };
    
    setTimeUntilTomorrow(calculateTimeUntilTomorrow());
    
    const timer = setInterval(() => {
      setTimeUntilTomorrow(calculateTimeUntilTomorrow());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const rankGradient = RANK_COLORS[rank as keyof typeof RANK_COLORS] || RANK_COLORS['Bronze'];
  const title = gameWon ? "Well done!" : "Better luck next time!";
  const message = gameWon 
    ? `You guessed the word in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}.`
    : "You didn't guess the word this time.";

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="mb-4">{message}</p>
          
          <div className="mb-6">
            <p className="text-sm mb-2">The word was:</p>
            <p className="text-3xl font-bold uppercase tracking-widest">{word}</p>
          </div>
          
          {gameWon && pointsEarned > 0 && (
            <div className="mb-6">
              <p className="text-sm mb-1">Points earned:</p>
              <p className="text-2xl font-bold text-green-500 dark:text-green-400">+{pointsEarned}</p>
            </div>
          )}
          
          <div className="flex justify-center items-center mb-4">
            <div className={`rank-badge bg-gradient-to-r ${rankGradient} text-white shadow-lg`}>
              <span className="mr-1">Your Rank:</span>
              <span className="font-bold">{rank}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
          <p className="text-center text-sm">
            Next word in {formatCountdown(timeUntilTomorrow)}
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onShareResults}
            >
              Share Results
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={onViewStats}
            >
              View Statistics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
