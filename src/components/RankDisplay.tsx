
import { getRankInfo } from '@/utils/rankSystem';

interface RankDisplayProps {
  rating: number;
  rank: string;
}

export const RankDisplay = ({ rating, rank }: RankDisplayProps) => {
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
            <p className="text-slate-400 text-sm">{rating} Rating</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Next: {rankInfo.nextRank}</p>
          <p className="text-xs text-slate-400">{rankInfo.nextThreshold - rating} to go</p>
        </div>
      </div>
    </div>
  );
};
