import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { RANK_COLORS, RANK_THRESHOLDS, type PlayerStats } from "@/lib/constants";
import { parseDistribution } from "@/lib/utils";

interface StatisticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: PlayerStats;
}

export function StatisticsModal({ open, onOpenChange, stats }: StatisticsModalProps) {
  const distribution = parseDistribution(stats.distribution);
  const maxDistribution = Math.max(...distribution.map(d => d.count));
  
  // Calculate progress to next rank
  let nextRank = '';
  let pointsToNextRank = 0;
  
  if (stats.rank === 'Bronze') {
    nextRank = 'Silver';
    pointsToNextRank = RANK_THRESHOLDS['Silver'] - stats.score;
  } else if (stats.rank === 'Silver') {
    nextRank = 'Gold';
    pointsToNextRank = RANK_THRESHOLDS['Gold'] - stats.score;
  } else if (stats.rank === 'Gold') {
    nextRank = 'Platinum';
    pointsToNextRank = RANK_THRESHOLDS['Platinum'] - stats.score;
  } else if (stats.rank === 'Platinum') {
    nextRank = 'Diamond';
    pointsToNextRank = RANK_THRESHOLDS['Diamond'] - stats.score;
  }
  
  const progressPercentage = nextRank 
    ? Math.min(100, Math.floor((stats.score - (RANK_THRESHOLDS[stats.rank as keyof typeof RANK_THRESHOLDS] || 0)) / 
      (pointsToNextRank + 0.001) * 100))
    : 100;
  
  const rankGradient = RANK_COLORS[stats.rank as keyof typeof RANK_COLORS] || RANK_COLORS['Bronze'];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-xl font-bold">Statistics</DialogTitle>
          <DialogClose className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <X className="h-6 w-6" />
          </DialogClose>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.played}</p>
            <p className="text-xs">Played</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}</p>
            <p className="text-xs">Win %</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.currentStreak}</p>
            <p className="text-xs">Current Streak</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.maxStreak}</p>
            <p className="text-xs">Max Streak</p>
          </div>
        </div>
        
        <h3 className="font-bold mb-2 text-center">Guess Distribution</h3>
        <div className="space-y-1 mb-6">
          {distribution.map((dist, index) => (
            <div key={index} className="flex items-center">
              <div className="w-4 mr-2 text-right font-mono">{index + 1}</div>
              <div 
                className={`${dist.count > 0 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'} rounded px-2 py-1 text-right min-w-[20px]`}
                style={{ 
                  width: dist.count > 0 
                    ? `${Math.max(5, dist.count / maxDistribution * 100)}%` 
                    : '5%' 
                }}
              >
                <span className="text-xs">{dist.count}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="font-bold mb-2 text-center">Ranking Details</h3>
          <div className="flex justify-center items-center mb-4">
            <div className={`rank-badge bg-gradient-to-r ${rankGradient} text-white shadow-lg`}>
              <span className="mr-1">Rank:</span>
              <span className="font-bold">{stats.rank}</span>
              <span className="ml-2 text-xs">(Score: {stats.score})</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-center mb-2">
              Rank progression: <span className="font-semibold">Bronze → Silver → Gold → Platinum → Diamond</span>
            </p>
            
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className={`bg-gradient-to-r ${rankGradient} h-2.5 rounded-full`} 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            {nextRank && (
              <p className="flex justify-between">
                <span>To next rank:</span>
                <span className="font-mono">{pointsToNextRank} points</span>
              </p>
            )}
            
            <p className="flex justify-between">
              <span>Position:</span>
              <span className="font-mono">
                {stats.rank === 'Diamond' ? 'Top 1%' : 
                 stats.rank === 'Platinum' ? 'Top 5%' : 
                 stats.rank === 'Gold' ? 'Top 15%' : 
                 stats.rank === 'Silver' ? 'Top 40%' : 'Top 80%'}
              </span>
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onOpenChange(false)}
          >
            Continue Playing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
