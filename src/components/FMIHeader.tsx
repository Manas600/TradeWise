import { useEffect, useState } from "react";
import { LEVELS } from "@/hooks/useGameState";
import { Trophy, Star } from "lucide-react";

interface Props {
  score: number;
  level: number | string; // Accepts string to prevent crashes if Index.tsx passes "Level 2"
}

const FMIHeader = ({ score, level }: Props) => {
  // Safely extract just the number from the level prop
  const safeLevel = typeof level === 'string' ? parseInt(level.replace(/\D/g, '')) || 1 : level;

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(safeLevel);

  useEffect(() => {
    if (safeLevel > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(safeLevel);
      setTimeout(() => setShowLevelUp(false), 4000);
    }
  }, [safeLevel, prevLevel]);

  // safeLevel is 1-based (Level 1, 2, 3...). Arrays are 0-based.
  const currentLevelDef = LEVELS[safeLevel - 1] || LEVELS[0];
  const nextLevelDef = LEVELS[safeLevel]; // This grabs the NEXT level

  const minXp = currentLevelDef.xpRequired;
  const maxXp = nextLevelDef ? nextLevelDef.xpRequired : minXp;

  // Calculate percentage safely
  const progressPct = nextLevelDef
    ? Math.min(100, Math.max(0, ((score - minXp) / (maxXp - minXp)) * 100))
    : 100;

  const tierColors = [
    "from-gray-500 to-slate-400",    // Lvl 1: Bronze
    "from-blue-500 to-cyan-400",     // Lvl 2: Blue
    "from-emerald-500 to-green-400", // Lvl 3: Green
    "from-purple-500 to-fuchsia-400",// Lvl 4: Purple
    "from-amber-500 to-orange-500"   // Lvl 5: Gold
  ];
  const currentTheme = tierColors[safeLevel - 1] || tierColors[0];

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${currentTheme} shadow-lg`}>
              <Trophy className="h-8 w-8 text-white drop-shadow-md" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Level {safeLevel}</p>
              <h2 className="text-2xl font-black text-foreground">{currentLevelDef.title}</h2>
              <p className="text-xs text-muted-foreground">{currentLevelDef.subtitle} Unlocked</p>
            </div>
          </div>

          <div className="flex-1 md:ml-12 md:mr-8">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-2xl font-black text-foreground">
                {score} <span className="text-sm font-normal text-muted-foreground">XP</span>
              </span>
              {nextLevelDef ? (
                <span className="text-sm font-bold text-muted-foreground">
                  {maxXp - score} XP to Level {safeLevel + 1}
                </span>
              ) : (
                <span className="text-sm font-bold text-neon-amber">MAX LEVEL</span>
              )}
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-secondary shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${currentTheme} transition-all duration-1000 ease-out`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {nextLevelDef && (
              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                Target: {maxXp} XP
              </p>
            )}
          </div>
        </div>
      </div>

      {showLevelUp && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-500 slide-in-from-bottom-10">
            <Star className="mb-4 h-24 w-24 animate-pulse text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
            <h1 className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-6xl font-black tracking-tighter text-transparent drop-shadow-xl">
              LEVEL UP!
            </h1>
            <p className="mt-4 text-2xl font-bold text-white">You are now <span className="text-yellow-400">{currentLevelDef.title}</span></p>
          </div>
        </div>
      )}
    </>
  );
};

export default FMIHeader;