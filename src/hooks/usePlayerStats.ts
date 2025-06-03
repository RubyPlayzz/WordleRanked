
import { useState, useCallback, useEffect } from 'react';
import { calculateEloChange, getRankFromRating } from '@/utils/eloSystem';

interface PlayerStats {
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  placementMatches: number;
  isPlacementPhase: boolean;
}

const DEFAULT_STATS: PlayerStats = {
  rating: 1200,
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  placementMatches: 0,
  isPlacementPhase: true
};

const STORAGE_KEY = 'wordle-ranked-stats';

export const usePlayerStats = () => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all required fields exist
        return {
          ...DEFAULT_STATS,
          ...parsed
        };
      }
    } catch (error) {
      console.warn('Failed to load player stats from localStorage:', error);
    }
    return DEFAULT_STATS;
  });

  // Save to localStorage whenever stats change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playerStats));
    } catch (error) {
      console.warn('Failed to save player stats to localStorage:', error);
    }
  }, [playerStats]);

  const updateStats = useCallback((won: boolean, guessCount: number): number => {
    let ratingChange = 0;
    
    const newPlacementMatches = playerStats.placementMatches + 1;
    const isStillInPlacement = newPlacementMatches < 10;
    
    if (playerStats.isPlacementPhase) {
      // During placement matches, use a more dramatic rating change
      ratingChange = calculatePlacementElo(won, guessCount, playerStats.placementMatches);
    } else {
      // Normal ranked matches
      ratingChange = calculateEloChange(won, guessCount, playerStats.rating);
    }
    
    const newStats: PlayerStats = {
      rating: Math.max(0, playerStats.rating + ratingChange),
      gamesPlayed: playerStats.gamesPlayed + 1,
      gamesWon: playerStats.gamesWon + (won ? 1 : 0),
      currentStreak: won ? playerStats.currentStreak + 1 : 0,
      maxStreak: won 
        ? Math.max(playerStats.maxStreak, playerStats.currentStreak + 1)
        : playerStats.maxStreak,
      placementMatches: newPlacementMatches,
      isPlacementPhase: isStillInPlacement
    };

    setPlayerStats(newStats);
    return ratingChange;
  }, [playerStats]);

  const getCurrentRank = useCallback(() => {
    if (playerStats.isPlacementPhase) {
      return 'Unranked';
    }
    return getRankFromRating(playerStats.rating);
  }, [playerStats.rating, playerStats.isPlacementPhase]);

  return {
    playerStats,
    updateStats,
    getCurrentRank
  };
};

// Placement match Elo calculation - more dramatic changes
const calculatePlacementElo = (won: boolean, guessCount: number, matchNumber: number): number => {
  let baseChange = 0;
  
  if (won) {
    switch (guessCount) {
      case 1: baseChange = 120; break;
      case 2: baseChange = 100; break;
      case 3: baseChange = 80; break;
      case 4: baseChange = 60; break;
      case 5: baseChange = 40; break;
      case 6: baseChange = 20; break;
      default: baseChange = 20; break;
    }
  } else {
    baseChange = -60;
  }
  
  // Early placement matches have more impact
  const multiplier = Math.max(0.5, 1 - (matchNumber * 0.05));
  
  return Math.floor(baseChange * multiplier);
};
