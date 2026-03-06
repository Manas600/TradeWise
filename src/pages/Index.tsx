import FMIHeader from "@/components/FMIHeader";
import GamifiedStaircase from "@/components/GamifiedStaircase";
import PortfolioChart from "@/components/PortfolioChart";
import QuickTrade from "@/components/QuickTrade";
import PortfolioHoldings from "@/components/PortfolioHoldings";
import { useGameState, LEVELS } from "@/hooks/useGameState";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";

const Index = () => {
  const game = useGameState();

  const levelDef = LEVELS[game.currentLevel - 1];

  return (
    <div className="min-h-screen bg-background">
      <FMIHeader
        score={game.xp}
        maxScore={LEVELS[LEVELS.length - 1].xpRequired}
        level={`Level ${game.currentLevel}`}
        levelName={levelDef.title}
      />

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Simulate Month + Stats Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
          <Button
            onClick={game.simulateMonth}
            size="lg"
            className="gap-2 bg-neon-blue text-primary-foreground glow-blue hover:bg-neon-blue/90 font-bold"
          >
            <CalendarClock className="h-5 w-5" />
            Simulate 1 Month
          </Button>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Month: </span>
              <span className="font-mono font-bold text-foreground">{game.month}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cash: </span>
              <span className="font-mono font-bold text-neon-green">₹{game.cashBalance.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Portfolio: </span>
              <span className="font-mono font-bold text-foreground">₹{game.portfolioValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Return: </span>
              <span className={`font-mono font-bold ${game.totalReturn >= 0 ? "text-neon-green" : "text-neon-red"}`}>
                {game.totalReturn >= 0 ? "+" : ""}{game.totalReturn.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">XP: </span>
              <span className="font-mono font-bold text-neon-amber">{game.xp}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            <GamifiedStaircase xp={game.xp} currentLevel={game.currentLevel} />
            <PortfolioChart assets={game.assets} month={game.month} />
            {game.portfolio.length > 0 && (
              <PortfolioHoldings
                portfolio={game.portfolio}
                assets={game.assets}
                onSell={game.sellAsset}
              />
            )}
          </div>

          {/* Right column */}
          <div>
            <QuickTrade
              assets={game.assets}
              currentLevel={game.currentLevel}
              isAssetUnlocked={game.isAssetUnlocked}
              onBuy={game.buyAsset}
              cashBalance={game.cashBalance}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
