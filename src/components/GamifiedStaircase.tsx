import { CheckCircle2, Lock, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaircaseLevel {
  id: number;
  title: string;
  subtitle: string;
  status: "unlocked" | "in-progress" | "locked";
  holdingRemaining?: string;
  quizAvailable?: boolean;
}

const levels: StaircaseLevel[] = [
  {
    id: 1,
    title: "The Owner",
    subtitle: "Index Funds & ETFs",
    status: "unlocked",
  },
  {
    id: 2,
    title: "The Analyst",
    subtitle: "Mid-Cap Stocks",
    status: "in-progress",
    holdingRemaining: "2 months holding remaining",
    quizAvailable: true,
  },
  {
    id: 3,
    title: "The Strategist",
    subtitle: "Futures & Options",
    status: "locked",
  },
];

const GamifiedStaircase = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Your Investment Staircase
      </h2>

      <div className="space-y-3">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`relative rounded-lg border p-4 transition-all ${
              level.status === "unlocked"
                ? "border-neon-green/40 bg-neon-green/5 glow-green"
                : level.status === "in-progress"
                ? "border-neon-amber/30 bg-neon-amber/5"
                : "border-border bg-secondary/30 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Status icon */}
                {level.status === "unlocked" && (
                  <CheckCircle2 className="h-5 w-5 text-neon-green" />
                )}
                {level.status === "in-progress" && (
                  <Clock className="h-5 w-5 text-neon-amber animate-pulse-glow" />
                )}
                {level.status === "locked" && (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Level {level.id}
                  </p>
                  <p className="font-semibold text-foreground">{level.title}</p>
                  <p className="text-sm text-muted-foreground">{level.subtitle}</p>
                </div>
              </div>

              {/* Right side actions */}
              {level.status === "unlocked" && (
                <span className="rounded-full bg-neon-green/10 px-3 py-1 text-xs font-semibold text-neon-green">
                  Active
                </span>
              )}
              {level.status === "locked" && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Progress info for in-progress level */}
            {level.status === "in-progress" && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{level.holdingRemaining}</span>
                  <span className="font-mono text-neon-amber">65%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-neon-amber transition-all duration-1000"
                    style={{ width: "65%" }}
                  />
                </div>
                <Button
                  disabled
                  size="sm"
                  className="mt-1 gap-2 border border-neon-amber/30 bg-neon-amber/10 text-neon-amber opacity-50"
                >
                  <BookOpen className="h-3 w-3" />
                  Take Competency Quiz
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamifiedStaircase;
