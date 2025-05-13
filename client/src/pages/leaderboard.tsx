import { Button } from "@/components/ui/button";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function LeaderboardPage() {
  const [, navigate] = useLocation();

  return (
    <div className="container py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="mr-2" 
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Wordle Ranked Leaderboard</h1>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-muted-foreground">
          See how you compare to other players. Rankings are based on ELO rating and updated after each game.
          Players with higher scores and ELO ratings are ranked higher on the leaderboard.
        </p>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <LeaderboardTable />
      </div>
    </div>
  );
}