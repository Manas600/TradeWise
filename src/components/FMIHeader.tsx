import { Shield, TrendingUp } from "lucide-react";

interface FMIHeaderProps {
  score: number;
  maxScore: number;
  level: string;
  levelName: string;
}

const FMIHeader = ({ score, maxScore, level, levelName }: FMIHeaderProps) => {
  const percentage = (score / maxScore) * 100;

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-blue">
          <Shield className="h-5 w-5 text-neon-blue" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            GuardRail<span className="text-neon-blue"> Invest</span>
          </h1>
          <p className="text-xs text-muted-foreground">Smart investing, safely.</p>
        </div>
      </div>

      {/* FMI Score */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Financial Maturity Index
          </p>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-neon-green" />
            <span className="text-2xl font-bold text-foreground text-glow-blue">
              {score}
            </span>
            <span className="text-sm text-muted-foreground">/ {maxScore}</span>
          </div>
        </div>

        {/* Progress ring */}
        <div className="relative h-12 w-12">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="hsl(var(--neon-blue))"
              strokeWidth="3"
              strokeDasharray={`${percentage * 1.256} 125.6`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>

        {/* Level Badge */}
        <div className="rounded-lg border border-neon-blue/30 bg-primary/10 px-4 py-2 glow-blue">
          <p className="text-[10px] font-medium uppercase tracking-widest text-neon-blue">
            {level}
          </p>
          <p className="text-sm font-semibold text-foreground">{levelName}</p>
        </div>
      </div>
    </header>
  );
};

export default FMIHeader;
