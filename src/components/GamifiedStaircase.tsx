import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { LEVELS } from "@/hooks/useGameState";

interface Props {
  xp: number;
  currentLevel: number;
}

const GamifiedStaircase = ({ xp, currentLevel }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Your Investment Staircase
      </h2>

      <div className="space-y-3">
        {LEVELS.map((level) => {
          const isUnlocked = currentLevel >= level.id;
          const isCurrent = currentLevel === level.id;
          const nextXp = level.id < LEVELS.length ? LEVELS[level.id].xpRequired : null;
          const progress = isCurrent && nextXp
            ? Math.min(100, ((xp - level.xpRequired) / (nextXp - level.xpRequired)) * 100)
            : isUnlocked ? 100 : 0;

          return (
            <div
              key={level.id}
              className={`relative rounded-lg border p-4 transition-all ${
                isUnlocked && !isCurrent
                  ? "border-neon-green/40 bg-neon-green/5 glow-green"
                  : isCurrent
                  ? "border-neon-amber/30 bg-neon-amber/5"
                  : "border-border bg-secondary/30 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isUnlocked && !isCurrent && (
                    <CheckCircle2 className="h-5 w-5 text-neon-green" />
                  )}
                  {isCurrent && (
                    <Sparkles className="h-5 w-5 text-neon-amber animate-pulse-glow" />
                  )}
                  {!isUnlocked && (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Level {level.id} — {level.xpRequired}+ XP
                    </p>
                    <p className="font-semibold text-foreground">{level.title}</p>
                    <p className="text-sm text-muted-foreground">{level.subtitle}</p>
                  </div>
                </div>

                {isUnlocked && !isCurrent && (
                  <span className="rounded-full bg-neon-green/10 px-3 py-1 text-xs font-semibold text-neon-green">
                    Unlocked
                  </span>
                )}
                {isCurrent && (
                  <span className="rounded-full bg-neon-amber/10 px-3 py-1 text-xs font-semibold text-neon-amber">
                    Current
                  </span>
                )}
                {!isUnlocked && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Progress bar for current level */}
              {isCurrent && nextXp && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {xp} / {nextXp} XP to next level
                    </span>
                    <span className="font-mono text-neon-amber">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-neon-amber transition-all duration-1000"
                      style={{ width: `${progress}%` }}
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
