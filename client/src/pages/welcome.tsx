import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

export default function Welcome() {
  const [, navigate] = useLocation();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  // Function to create a guest account and redirect to game
  const handlePlayAsGuest = () => {
    // Create a unique guest ID
    const guestId = Date.now();
    const guestToken = `guest_${Math.random().toString(36).substring(2, 15)}`;
    
    // Create a guest user
    const guestUser = {
      id: guestId,
      username: `Guest_${guestId}`,
      displayName: `Guest Player`,
      profilePicture: 'avatar1',
      isGuest: true,
    };
    
    // Save guest user to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(guestUser));
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, guestToken);
    
    // Create initial game stats for guest
    const initialStats = {
      userId: guestId,
      played: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      score: 0,
      eloRating: 1000,
      rank: 'Bronze',
      distribution: "0,0,0,0,0,0",
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.GAME_STATS, JSON.stringify(initialStats));
    
    // Redirect to game page
    navigate("/");
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-900">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-2">
            Wordle Ranked
          </CardTitle>
          <p className="text-muted-foreground">
            Play Wordle and climb the competitive ranks!
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-14 text-lg font-semibold"
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="h-14 text-lg font-semibold border-2" 
              onClick={handlePlayAsGuest}
            >
              Play Now
            </Button>
          </div>
          
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <span className="relative bg-background px-3 text-muted-foreground text-sm">
              or
            </span>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="link"
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            onClick={() => navigate("/login")}
          >
            Already have an account? Log in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}