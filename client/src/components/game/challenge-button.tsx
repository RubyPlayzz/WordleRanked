import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Swords, Copy, Clock } from "lucide-react";

interface ChallengeButtonProps {
  currentWord: string;
  className?: string;
}

export function ChallengeButton({ currentWord, className = "" }: ChallengeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [challengeExpiry, setChallengeExpiry] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateChallengeCode = () => {
    setIsLoading(true);
    
    // Generate a random challenge code (for demo purposes)
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Set an expiry time of 24 hours from now
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);
    
    setTimeout(() => {
      setChallengeCode(randomCode);
      setChallengeExpiry(expiryTime);
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    if (!challengeCode) return;
    
    const challengeUrl = `${window.location.origin}?challenge=${challengeCode}`;
    
    navigator.clipboard.writeText(challengeUrl).then(() => {
      toast({
        title: "Challenge link copied!",
        description: "Share this link with a friend to challenge them.",
        duration: 3000,
      });
    }).catch((err) => {
      console.error("Could not copy challenge link:", err);
      toast({
        title: "Failed to copy link",
        description: "Please try again or copy it manually.",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const formatExpiry = (date: Date) => {
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const resetChallenge = () => {
    setChallengeCode(null);
    setChallengeExpiry(null);
  };

  const closeDialog = () => {
    setIsOpen(false);
    resetChallenge();
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline"
        className={`flex items-center ${className}`}
      >
        <Swords className="mr-2 h-4 w-4" />
        Challenge a Friend
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Challenge a Friend</DialogTitle>
            <DialogDescription>
              Create a challenge link to share the same starting word with a friend and compete!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!challengeCode ? (
              <div className="flex justify-center">
                <Button 
                  onClick={generateChallengeCode} 
                  className="w-full md:w-auto" 
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Challenge Code"}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="challenge-code">Challenge Code</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="challenge-code" 
                      value={challengeCode} 
                      readOnly 
                      className="font-mono text-center text-lg"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copyToClipboard}
                      title="Copy challenge link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {challengeExpiry && (
                  <div className="text-sm text-muted-foreground flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      Challenge expires at {formatExpiry(challengeExpiry)}
                    </span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-sm text-center">
                    Share this code with a friend and compare your results!
                    Both of you will play with the word "{currentWord.toUpperCase()}".
                  </p>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={closeDialog}
            >
              {challengeCode ? "Close" : "Cancel"}
            </Button>
            
            {challengeCode && (
              <Button 
                variant="outline" 
                onClick={resetChallenge}
              >
                Generate New Code
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}