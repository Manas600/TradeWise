import { LEVELS } from "@/hooks/useGameState";
import { Lock, CheckCircle2, ChevronRight, Target } from "lucide-react";

interface Props {
  xp: number;
  currentLevel: number;
}

const GamifiedStaircase = ({ xp, currentLevel }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold">Your Investment Staircase</h3>
        <p className="text-sm text-muted-foreground">
          Unlock new asset classes by demonstrating financial maturity.
        </p>
      </div>

      <div className="space-y-4">
        {LEVELS.map((level, index) => {
          const isUnlocked = currentLevel >= level.id;
          const isCurrent = currentLevel === level.id;
          const isCompleted = currentLevel > level.id;
          
          const nextLevel = LEVELS[index + 1];
          const minXp = level.xpRequired;
          const maxXp = nextLevel ? nextLevel.xpRequired : minXp;
          
          let progressPct = 0;
          if (isCompleted) progressPct = 100;
          else if (isCurrent && nextLevel) {
            progressPct = Math.min(100, Math.max(0, ((xp - minXp) / (maxXp - minXp)) * 100));
          }

          return (
            <div
              key={level.id}
              className={`relative flex flex-col gap-3 rounded-xl border p-4 transition-all ${
                isCurrent
                  ? "border-neon-blue/50 bg-neon-blue/5 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                  : isUnlocked
                  ? "border-border bg-secondary/20"
                  : "border-border/50 bg-background/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-neon-green" />
                    ) : isCurrent ? (
                      <Target className="h-5 w-5 text-neon-blue" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Title & Subtitle */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Level {level.id}
                      </span>
                      {isCurrent && (
                        <span className="rounded bg-neon-blue/20 px-2 py-0.5 text-[10px] font-bold text-neon-blue">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <h4 className={`font-bold ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                      {level.title}
                    </h4>
                  </div>
                </div>
                
                {/* Unlocked Assets Preview */}
                <div className="text-right">
                  <span className={`text-sm ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    {level.subtitle}
                  </span>
                </div>
              </div>

              {/* Progress Bar (Only show for current level) */}
              {isCurrent && nextLevel && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{xp} XP</span>
                    <span>{maxXp} XP</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-neon-blue transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamifiedStaircase;