import { type TileData } from "@/lib/constants";
import { getTileStateClass } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  boardState: TileData[][];
  currentRow: number;
}

export function GameBoard({ boardState, currentRow }: GameBoardProps) {
  return (
    <div className="game-board flex-grow grid grid-rows-6 gap-1 mb-4 mx-auto w-full max-w-xs">
      {boardState.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={cn("grid grid-cols-5 gap-1")}
        >
          {row.map((tile, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "tile aspect-square border-2",
                getTileStateClass(tile.state),
                {
                  "bounce": tile.state === "correct" && rowIndex < currentRow
                }
              )}
              style={{
                // Add a delay for the reveal animation
                animationDelay: rowIndex === currentRow - 1 ? `${colIndex * 100}ms` : "0ms",
              }}
            >
              {tile.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
