
import { useState, useCallback } from 'react';
import { calculateEloChange, getRankFromRating } from '@/utils/eloSystem';

interface PlayerStats {
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}

const DEFAULT_STATS: PlayerStats = {
  rating: 1200,
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0
};

export const usePlayerStats = () => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('wordle-ranked-stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const updateStats = useCallback((won: boolean, guessCount: number): number => {
    const ratingChange = calculateEloChange(won, guessCount, playerStats.rating);
    
    const newStats: PlayerStats = {
      rating: Math.max(0, playerStats.rating + ratingChange),
      gamesPlayed: playerStats.gamesPlayed + 1,
      gamesWon: playerStats.gamesWon + (won ? 1 : 0),
      currentStreak: won ? playerStats.currentStreak + 1 : 0,
      maxStreak: won 
        ? Math.max(playerStats.maxStreak, playerStats.currentStreak + 1)
        : playerStats.maxStreak
    };

    setPlayerStats(newStats);
    localStorage.setItem('wordle-ranked-stats', JSON.stringify(newStats));
    
    return ratingChange;
  }, [playerStats]);

  const getCurrentRank = useCallback(() => {
    return getRankFromRating(playerStats.rating);
  }, [playerStats.rating]);

  return {
    playerStats,
    updateStats,
    getCurrentRank
  };
};
