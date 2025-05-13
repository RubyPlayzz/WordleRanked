import { RANK_COLORS } from "@/lib/constants";

interface RankDisplayProps {
  rank: string;
  score: number;
  className?: string;
}

export function RankDisplay({ rank, score, className = "" }: RankDisplayProps) {
  const gradientClass = RANK_COLORS[rank as keyof typeof RANK_COLORS] || RANK_COLORS['Bronze'];
  
  return (
    <div className={`flex justify-center items-center mt-2 ${className}`}>
      <div className={`rank-badge bg-gradient-to-r ${gradientClass} text-white`}>
        <span className="mr-1">Rank:</span>
        <span className="font-bold">{rank}</span>
        <span className="ml-2 text-xs">(Score: {score})</span>
      </div>
    </div>
  );
}
