import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { RANK_COLORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  profilePicture: string;
  score: number;
  eloRating: number;
  rank: string;
  gamesPlayed: number;
  winRate: number;
}

export function LeaderboardTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiRequest('GET', '/api/leaderboard?limit=100');
        
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  // Format a number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>;
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">ELO Rating</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Win Rate</TableHead>
            <TableHead className="text-center">Games</TableHead>
            <TableHead className="text-center">Tier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
              </TableRow>
            ))
          ) : leaderboard.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No players found. Be the first to play and join the leaderboard!
              </TableCell>
            </TableRow>
          ) : (
            leaderboard.map((entry, index) => {
              const rankColor = RANK_COLORS[entry.rank as keyof typeof RANK_COLORS] || RANK_COLORS['Bronze'];
              
              return (
                <TableRow key={entry.id}>
                  <TableCell className="text-center font-mono font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={entry.profilePicture} 
                          alt={`${entry.displayName || entry.username}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium">
                        {entry.displayName || entry.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono">{formatNumber(entry.eloRating)}</TableCell>
                  <TableCell className="text-center font-mono">{formatNumber(entry.score)}</TableCell>
                  <TableCell className="text-center">{entry.winRate}%</TableCell>
                  <TableCell className="text-center">{entry.gamesPlayed}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`bg-gradient-to-r ${rankColor} text-white`}>
                      {entry.rank}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}