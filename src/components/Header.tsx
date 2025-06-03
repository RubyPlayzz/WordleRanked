
import { Trophy, Target } from 'lucide-react';

export const Header = () => {
  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Trophy className="w-8 h-8 text-yellow-400" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Wordle Ranked
        </h1>
        <Target className="w-8 h-8 text-yellow-400" />
      </div>
      <p className="text-slate-400 text-sm">
        Competitive Wordle • Climb the ranks • Prove your skills
      </p>
    </header>
  );
};
