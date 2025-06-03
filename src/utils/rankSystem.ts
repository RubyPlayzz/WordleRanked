
export interface RankInfo {
  icon: string;
  gradient: string;
  description: string;
  nextRank: string;
  nextThreshold: number;
}

export const getRankInfo = (rank: string): RankInfo => {
  switch (rank) {
    case 'Bronze':
      return {
        icon: '🟫',
        gradient: 'bg-gradient-to-br from-amber-700 to-amber-900',
        description: 'Learning the ropes',
        nextRank: 'Silver',
        nextThreshold: 1000
      };
    case 'Silver':
      return {
        icon: '🪙',
        gradient: 'bg-gradient-to-br from-slate-400 to-slate-600',
        description: 'Making progress',
        nextRank: 'Gold',
        nextThreshold: 1300
      };
    case 'Gold':
      return {
        icon: '🥇',
        gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        description: 'Skilled player',
        nextRank: 'Diamond',
        nextThreshold: 1600
      };
    case 'Diamond':
      return {
        icon: '💎',
        gradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
        description: 'Elite wordsmith',
        nextRank: 'Platinum',
        nextThreshold: 1900
      };
    case 'Platinum':
      return {
        icon: '🔷',
        gradient: 'bg-gradient-to-br from-cyan-300 to-cyan-500',
        description: 'Master player',
        nextRank: 'Champion',
        nextThreshold: 2200
      };
    case 'Champion':
      return {
        icon: '👑',
        gradient: 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500',
        description: 'Word legend',
        nextRank: 'Arch-Champion',
        nextThreshold: 2500
      };
    case 'Arch-Champion':
      return {
        icon: '🔱',
        gradient: 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500',
        description: 'Mythical status',
        nextRank: 'Peak',
        nextThreshold: 9999
      };
    default:
      return {
        icon: '🟫',
        gradient: 'bg-gradient-to-br from-amber-700 to-amber-900',
        description: 'Unranked',
        nextRank: 'Silver',
        nextThreshold: 1000
      };
  }
};
