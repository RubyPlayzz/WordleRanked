import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-xl font-bold">How To Play</DialogTitle>
          <DialogClose className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <X className="h-6 w-6" />
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>Guess the WORDLE in 6 tries.</p>
          <p>Each guess must be a valid 5-letter word. Hit the enter button to submit.</p>
          <p>After each guess, the color of the tiles will change to show how close your guess was to the word.</p>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-bold mb-2">Examples</h3>
            
            <div className="mb-4">
              <div className="flex mb-1">
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 bg-correct text-white">W</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">E</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">A</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">R</div>
                <div className="tile aspect-square border-2 flex items-center justify-center w-12 h-12 border-gray-300 dark:border-gray-600">Y</div>
              </div>
              <p className="text-sm">The letter <span className="font-bold">W</span> is in the word and in the correct spot.</p>
            </div>
            
            <div className="mb-4">
              <div className="flex mb-1">
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">P</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 bg-present text-white">I</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">L</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">L</div>
                <div className="tile aspect-square border-2 flex items-center justify-center w-12 h-12 border-gray-300 dark:border-gray-600">S</div>
              </div>
              <p className="text-sm">The letter <span className="font-bold">I</span> is in the word but in the wrong spot.</p>
            </div>
            
            <div className="mb-4">
              <div className="flex mb-1">
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">V</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">A</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 border-gray-300 dark:border-gray-600">G</div>
                <div className="tile aspect-square border-2 flex items-center justify-center mr-1 w-12 h-12 bg-absent text-white">U</div>
                <div className="tile aspect-square border-2 flex items-center justify-center w-12 h-12 border-gray-300 dark:border-gray-600">E</div>
              </div>
              <p className="text-sm">The letter <span className="font-bold">U</span> is not in the word in any spot.</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-bold mb-2">Ranking System</h3>
            <p className="mb-2">Wordle Ranked tracks your performance with a competitive ranking system:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Earn points based on how quickly you solve each puzzle</li>
              <li>Fewer attempts = more points</li>
              <li>Progress through ranks: Bronze, Silver, Gold, Platinum, Diamond</li>
              <li>Compare your ranking with other players</li>
              <li>Maintain your streak to earn bonus points</li>
            </ul>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-center">A new WORDLE will be available each day!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
