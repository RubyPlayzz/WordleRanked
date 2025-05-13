import { useState, useEffect } from "react";
import { GameBoard } from "@/components/game-board";
import { GameKeyboard } from "@/components/game-keyboard";
import { RankDisplay } from "@/components/rank-display";
import { HelpModal } from "@/components/modals/help-modal";
import { StatisticsModal } from "@/components/modals/statistics-modal";
import { GameCompleteModal } from "@/components/modals/game-complete-modal";
import { ResultToast } from "@/components/result-toast";
import { useTheme } from "@/providers/theme-provider";
import { useGame } from "@/hooks/use-game";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { formatCountdown, getTimeUntilNextWord } from "@/lib/utils";
import { 
  HelpCircle, 
  BarChart, 
  Moon, 
  Sun,
  Loader2,
  Trophy,
  LogOut,
  User
} from "lucide-react";
import { LOCAL_STORAGE_KEYS, type PlayerStats } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileEditor } from "@/components/auth/profile-editor";

export default function Game() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [timeUntilNextWord, setTimeUntilNextWord] = useState<string>("");
  const [userData, setUserData] = useState<{
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  } | null>(null);
  const [stats, setStats] = useState<PlayerStats>({
    id: 0,
    userId: 0,
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    score: 0,
    distribution: "0,0,0,0,0,0",
    rank: "Bronze"
  });
  
  // Load user data
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        setUserData(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved user data", e);
      }
    }
  }, []);
  
  // Get the game hook
  const { 
    gameState, 
    loading, 
    error, 
    gameComplete,
    pointsEarned,
    handleKeyPress, 
    handleBackspace, 
    handleEnter
  } = useGame({ userId: userData?.id });
  
  // Update time until next word
  useEffect(() => {
    const updateTimer = () => {
      const timeMs = getTimeUntilNextWord();
      setTimeUntilNextWord(formatCountdown(timeMs));
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Show game complete modal when game is finished
  useEffect(() => {
    if (gameComplete && !showGameComplete) {
      // Short delay to allow animations to complete
      const timer = setTimeout(() => {
        setShowGameComplete(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [gameComplete, showGameComplete]);
  
  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem(LOCAL_STORAGE_KEYS.GAME_STATS);
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      } catch (e) {
        console.error("Error parsing saved stats", e);
      }
    }
  }, []);
  
  // Update stats when game is completed
  useEffect(() => {
    if (gameComplete && pointsEarned > 0) {
      setStats(prevStats => {
        const updatedStats = {
          ...prevStats,
          score: prevStats.score + pointsEarned
        };
        
        // Save to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEYS.GAME_STATS, JSON.stringify(updatedStats));
        
        return updatedStats;
      });
    }
  }, [gameComplete, pointsEarned]);

  const handleShareResults = () => {
    // Create shareable text of the game result
    let resultText = `Wordle Ranked ${new Date().toLocaleDateString()}\n`;
    resultText += `${gameState.gameStatus === 'won' ? gameState.currentRow : 'X'}/6\n\n`;
    
    // Add emoji grid
    for (let i = 0; i < gameState.currentRow; i++) {
      for (let j = 0; j < 5; j++) {
        const tileState = gameState.boardState[i][j].state;
        if (tileState === 'correct') {
          resultText += '🟩';
        } else if (tileState === 'present') {
          resultText += '🟨';
        } else {
          resultText += '⬛';
        }
      }
      resultText += '\n';
    }
    
    // Add rank
    resultText += `\nRank: ${stats.rank} (${stats.score} pts)`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(resultText).then(() => {
      toast({
        title: "Results copied to clipboard!",
        duration: 2000
      });
    }).catch(err => {
      console.error("Could not copy text: ", err);
      toast({
        title: "Could not copy results",
        description: "Please try again",
        variant: "destructive",
        duration: 2000
      });
    });
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.GAME_STATS);
    // Redirect to login page
    navigate("/login");
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setUserData(updatedUser);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading game...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-4 bg-primary text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="game-container" className="mx-auto max-w-md px-4 sm:px-6 py-4 flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="p-2 mr-1" 
              aria-label="Help"
              onClick={() => setHelpModalOpen(true)}
            >
              <HelpCircle className="h-6 w-6" />
            </button>
            <button 
              className="p-2" 
              aria-label="Leaderboard"
              onClick={() => navigate("/leaderboard")}
            >
              <Trophy className="h-6 w-6" />
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-center">Wordle Ranked</h1>
          
          <div className="flex items-center">
            <button 
              className="p-2 mr-1" 
              aria-label="Profile"
              onClick={() => setProfileEditorOpen(true)}
            >
              <User className="h-6 w-6" />
            </button>
            <button 
              className="p-2 mr-1" 
              aria-label="Statistics"
              onClick={() => setStatsModalOpen(true)}
            >
              <BarChart className="h-6 w-6" />
            </button>
            <button 
              className="p-2 mr-1" 
              aria-label="Toggle Dark Mode"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <button 
              className="p-2" 
              aria-label="Logout"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* User info & Rank Display */}
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm font-medium">
            {userData?.displayName || userData?.username || "Player"}
          </div>
          <RankDisplay rank={stats.rank} score={stats.score} />
        </div>
      </header>
      
      {/* Game Status Alert */}
      {gameState.showMessage && (
        <div className="text-center py-2 px-4 my-2 rounded-md bg-gray-100 dark:bg-gray-800 fade-in">
          <p className="text-sm font-medium">{gameState.message}</p>
        </div>
      )}
      
      {/* Game Board */}
      <GameBoard 
        boardState={gameState.boardState} 
        currentRow={gameState.currentRow} 
      />
      
      {/* Keyboard */}
      <GameKeyboard 
        keyboardState={gameState.keyboardState}
        onKeyPress={handleKeyPress}
        onEnter={handleEnter}
        onBackspace={handleBackspace}
      />
      
      {/* Next Word Timer (when game is completed) */}
      {gameComplete && (
        <div className="text-center py-2">
          <p className="text-sm">Next word in {timeUntilNextWord}</p>
        </div>
      )}
      
      {/* Modals */}
      <HelpModal 
        open={helpModalOpen} 
        onOpenChange={setHelpModalOpen} 
      />
      
      <StatisticsModal 
        open={statsModalOpen} 
        onOpenChange={setStatsModalOpen}
        stats={stats}
      />
      
      {showGameComplete && (
        <GameCompleteModal 
          open={showGameComplete}
          onShareResults={handleShareResults}
          onViewStats={() => {
            setShowGameComplete(false);
            setStatsModalOpen(true);
          }}
          gameWon={gameState.gameStatus === 'won'}
          attempts={gameState.currentRow}
          word={gameState.correctWord}
          pointsEarned={pointsEarned}
          rank={stats.rank}
        />
      )}
      
      {/* Logout confirmation dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? Your progress will be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Profile editor */}
      {profileEditorOpen && userData && (
        <Dialog open={profileEditorOpen} onOpenChange={setProfileEditorOpen}>
          <DialogContent className="sm:max-w-lg">
            <ProfileEditor
              userId={userData.id}
              onClose={() => setProfileEditorOpen(false)}
              onUpdate={handleProfileUpdate}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Toast for notifications */}
      <ResultToast 
        message={gameState.message} 
        visible={gameState.showMessage} 
      />
    </div>
  );
}
