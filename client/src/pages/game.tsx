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
import { formatCountdown, getTimeUntilNextWord } from "@/lib/utils";
import { 
  HelpCircle, 
  BarChart, 
  Moon, 
  Sun,
  Loader2
} from "lucide-react";
import { LOCAL_STORAGE_KEYS, type PlayerStats } from "@/lib/constants";

export default function Game() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [timeUntilNextWord, setTimeUntilNextWord] = useState<string>("");
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
  } = useGame();
  
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
          <button 
            className="p-2" 
            aria-label="Help"
            onClick={() => setHelpModalOpen(true)}
          >
            <HelpCircle className="h-6 w-6" />
          </button>
          
          <h1 className="text-3xl font-bold text-center">Wordle Ranked</h1>
          
          <div className="flex items-center">
            <button 
              className="p-2 mr-2" 
              aria-label="Statistics"
              onClick={() => setStatsModalOpen(true)}
            >
              <BarChart className="h-6 w-6" />
            </button>
            <button 
              className="p-2" 
              aria-label="Toggle Dark Mode"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Rank Display */}
        <RankDisplay rank={stats.rank} score={stats.score} />
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
      
      {/* Toast for notifications */}
      <ResultToast 
        message={gameState.message} 
        visible={gameState.showMessage} 
      />
    </div>
  );
}
