import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCountdown } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { RANK_COLORS, RANK_THRESHOLDS } from "@/lib/constants";
import { ChevronRight } from "lucide-react";

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

  // Calculate progress to next rank
  const calculateRankProgress = () => {
    // Get current rank threshold
    const currentThreshold = RANK_THRESHOLDS[rank as keyof typeof RANK_THRESHOLDS] || 0;
    
    // Find the next rank and its threshold
    let nextRank = '';
    let nextThreshold = 0;
    
    if (rank === 'Bronze') {
      nextRank = 'Silver';
      nextThreshold = RANK_THRESHOLDS['Silver'];
    } else if (rank === 'Silver') {
      nextRank = 'Gold';
      nextThreshold = RANK_THRESHOLDS['Gold'];
    } else if (rank === 'Gold') {
      nextRank = 'Platinum';
      nextThreshold = RANK_THRESHOLDS['Platinum'];
    } else if (rank === 'Platinum') {
      nextRank = 'Diamond';
      nextThreshold = RANK_THRESHOLDS['Diamond'];
    } else if (rank === 'Diamond') {
      nextRank = 'Champion';
      nextThreshold = RANK_THRESHOLDS['Champion'];
    } else {
      // Already at Champion rank
      return {
        progressPercent: 100,
        nextRank: null,
        pointsToNextRank: 0
      };
    }
    
    // Calculate percentage progress to next rank
    const rangeSize = nextThreshold - currentThreshold;
    
    // Assume we're accessing the pointsEarned from the prop, which is the player's total score 
    // after earning points in this game
    const pointsAboveThreshold = pointsEarned;
    const progressPercent = Math.min(100, Math.floor((pointsAboveThreshold / rangeSize) * 100));
    const pointsToNextRank = nextThreshold - pointsAboveThreshold;
    
    return {
      progressPercent,
      nextRank,
      pointsToNextRank
    };
  };
  
  const rankProgress = calculateRankProgress();

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
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
          
          {/* Rank Display */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-center items-center">
              <div className={`rank-badge bg-gradient-to-r ${rankGradient} text-white shadow-lg`}>
                <span className="mr-1">Your Rank:</span>
                <span className="font-bold">{rank}</span>
              </div>
            </div>
            
            {/* Rank Progress Bar */}
            {rankProgress.nextRank && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{rank}</span>
                  <div className="flex items-center">
                    <span>{rankProgress.nextRank}</span>
                    <ChevronRight className="h-3 w-3 inline ml-1" />
                  </div>
                </div>
                <Progress 
                  value={rankProgress.progressPercent} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {rankProgress.pointsToNextRank} points to {rankProgress.nextRank}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
          <p className="text-center text-sm">
            Next word in {formatCountdown(timeUntilTomorrow)}
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline"
              onClick={onShareResults}
              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
            >
              Share Results
            </Button>
            <Button 
              onClick={onViewStats}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              View Statistics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
