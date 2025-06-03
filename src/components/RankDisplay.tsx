
import { getRankInfo } from '@/utils/rankSystem';

interface RankDisplayProps {
  rating: number;
  rank: string;
  placementMatches?: number;
  isPlacementPhase?: boolean;
}

export const RankDisplay = ({ rating, rank, placementMatches = 0, isPlacementPhase = false }: RankDisplayProps) => {
  const rankInfo = getRankInfo(rank);
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${rankInfo.gradient}`}>
            {rankInfo.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{rank}</h3>
            {isPlacementPhase ? (
              <p className="text-slate-400 text-sm">Placement {placementMatches}/10</p>
            ) : (
              <p className="text-slate-400 text-sm">{rating} Rating</p>
            )}
          </div>
        </div>
        <div className="text-right">
          {isPlacementPhase ? (
            <>
              <p className="text-xs text-slate-500">Matches left</p>
              <p className="text-xs text-slate-400">{10 - placementMatches}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500">Next: {rankInfo.nextRank}</p>
              <p className="text-xs text-slate-400">{rankInfo.nextThreshold - rating} to go</p>
            </>
          )}
        </div>
      </div>
      {isPlacementPhase && (
        <div className="mt-3">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(placementMatches / 10) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
