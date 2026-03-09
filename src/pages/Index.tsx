import FMIHeader from "@/components/FMIHeader";
import GamifiedStaircase from "@/components/GamifiedStaircase";
import PortfolioChart from "@/components/PortfolioChart";
import QuickTrade from "@/components/QuickTrade";
import PortfolioHoldings from "@/components/PortfolioHoldings";
import { useGameState } from "@/hooks/useGameState";
import { Button } from "@/components/ui/button";
import { CalendarClock, FastForward, BrainCircuit, TrendingUp } from "lucide-react";
import XpLog from "@/components/XpLog";

const Index = () => {
  const game = useGameState();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* BRANDING NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue to-blue-600 shadow-lg shadow-neon-blue/20">
              <BrainCircuit className="absolute h-6 w-6 text-white opacity-50" />
              <TrendingUp className="absolute h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-foreground">
                Trade<span className="text-neon-blue">Wise</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Smart investing, safely.
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <FMIHeader
          score={game.xp}
          level={game.currentLevel}
        />

        {/* Simulate Month + Stats Bar */}
        <div className="mb-6 mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
          <Button
            onClick={game.simulateMonth}
            size="lg"
            className="gap-2 bg-neon-blue font-bold text-primary-foreground shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all hover:bg-neon-blue/90"
          >
            <CalendarClock className="h-5 w-5" />
            Simulate 1 Month
          </Button>

          <Button
            onClick={game.cheatLevelUp}
            variant="outline"
            size="sm"
            className="gap-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Presentation Mode: Jump to next level"
          >
            <FastForward className="h-4 w-4" />
            Force Level Up
          </Button>

          <div className="ml-auto flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Month: </span>
              <span className="font-mono font-bold text-foreground">{game.month}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cash: </span>
              <span className="font-mono font-bold text-neon-green">₹{game.cashBalance?.toLocaleString() || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Portfolio: </span>
              <span className="font-mono font-bold text-foreground">₹{game.portfolioValue?.toLocaleString() || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Return: </span>
              <span className={`font-mono font-bold ${(game.totalReturn || 0) >= 0 ? "text-neon-green" : "text-neon-red"}`}>
                {(game.totalReturn || 0) >= 0 ? "+" : ""}{(game.totalReturn || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT COLUMN: Analytics & Progression */}
          <div className="space-y-6 lg:col-span-2">
            <GamifiedStaircase xp={game.xp} currentLevel={game.currentLevel} />

            {game.assets && game.assets.length > 0 && (
              <PortfolioChart assets={game.assets} month={game.month} />
            )}
          </div>

          {/* RIGHT COLUMN: The Trading Zone (Buy, Sell, Log) */}
          <div className="space-y-6">

            {/* 1. The Buy Interface */}
            <QuickTrade
              assets={game.assets || []}
              currentLevel={game.currentLevel}
              isAssetUnlocked={game.isAssetUnlocked}
              onBuy={game.buyAsset}
              cashBalance={game.cashBalance || 0}
              month={game.month}
            />

            {/* 2. The Sell Interface (Moved here!) */}
            {game.portfolio && game.portfolio.length > 0 && (
              <PortfolioHoldings
                portfolio={game.portfolio}
                assets={game.assets}
                onSell={game.sellAsset}
              />
            )}

            {/* 3. The Action Log */}
            <XpLog logs={game.xpLog || []} />

          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;