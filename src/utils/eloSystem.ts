
// Elo rating system for competitive Wordle
export const calculateEloChange = (won: boolean, guessCount: number, currentRating: number): number => {
  // Base rating change
  let change = 0;
  
  if (won) {
    // Bonus for solving in fewer guesses
    switch (guessCount) {
      case 1: change = 50; break; // Incredible luck/skill
      case 2: change = 40; break; // Exceptional
      case 3: change = 30; break; // Excellent
      case 4: change = 20; break; // Good
      case 5: change = 15; break; // Decent
      case 6: change = 10; break; // Just made it
      default: change = 10; break;
    }
  } else {
    // Loss penalty
    change = -25;
  }
  
  // Adjust based on current rating (harder to gain at higher ratings)
  if (currentRating > 2000) {
    change = Math.floor(change * 0.5);
  } else if (currentRating > 1600) {
    change = Math.floor(change * 0.7);
  } else if (currentRating > 1200) {
    change = Math.floor(change * 0.85);
  }
  
  // Prevent rating from going below 0
  if (currentRating + change < 0) {
    change = -currentRating;
  }
  
  return change;
};

export const getRankFromRating = (rating: number): string => {
  if (rating >= 2500) return 'Arch-Champion';
  if (rating >= 2200) return 'Champion';
  if (rating >= 1900) return 'Platinum';
  if (rating >= 1600) return 'Diamond';
  if (rating >= 1300) return 'Gold';
  if (rating >= 1000) return 'Silver';
  return 'Bronze';
};
