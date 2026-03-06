import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import CoolDownModal from "./CoolDownModal";
import { Zap, AlertTriangle, TrendingUp, Lock } from "lucide-react";
import type { MarketAsset } from "@/hooks/useGameState";

interface Props {
  assets: MarketAsset[];
  currentLevel: number;
  isAssetUnlocked: (asset: MarketAsset) => boolean;
  onBuy: (assetId: string) => boolean;
  cashBalance: number;
}

const TRADE_WINDOW_MS = 60_000;
const NUDGE_THRESHOLD = 3;
const FREEZE_THRESHOLD = 5;

const QuickTrade = ({ assets = [], currentLevel, isAssetUnlocked, onBuy, cashBalance }: Props) => {
  const firstUnlocked = assets.find((a) => isAssetUnlocked(a));
  const [selectedAsset, setSelectedAsset] = useState(firstUnlocked?.id ?? assets[0]?.id ?? "");
  const [isFrozen, setIsFrozen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tradeCount, setTradeCount] = useState(0);
  const tradeTimestamps = useRef<number[]>([]);
  const { toast } = useToast();

  const currentAsset = assets.find((a) => a.id === selectedAsset);
  const unlocked = currentAsset ? isAssetUnlocked(currentAsset) : false;

  const handleBuy = useCallback(() => {
    if (isFrozen || !currentAsset || !unlocked) return;

    const now = Date.now();
    tradeTimestamps.current = tradeTimestamps.current.filter((t) => now - t < TRADE_WINDOW_MS);
    tradeTimestamps.current.push(now);
    const count = tradeTimestamps.current.length;
    setTradeCount(count);

    if (count >= FREEZE_THRESHOLD) {
      setIsFrozen(true);
      setShowModal(true);
      return;
    }

    if (count >= NUDGE_THRESHOLD) {
      toast({
        title: "⚠️ Hold up!",
        description: `You've made ${count} trades in 1 minute. Your estimated transaction costs are ₹${count * 50}. Consider your strategy.`,
        variant: "destructive",
        duration: 5000,
      });
    }

    const success = onBuy(selectedAsset);
    if (success && count < NUDGE_THRESHOLD) {
      toast({
        title: "✅ Trade Executed",
        description: `Bought 1x ${currentAsset.label} at ₹${currentAsset.price.toLocaleString()}.`,
        duration: 2000,
      });
    }
  }, [isFrozen, toast, currentAsset, unlocked, onBuy, selectedAsset]);

  const handleCoolDownComplete = useCallback(() => {
    setShowModal(false);
    setIsFrozen(false);
    setTradeCount(0);
    tradeTimestamps.current = [];
    toast({ title: "🟢 Trading Resumed", description: "Cool-down complete. Trade responsibly.", duration: 3000 });
  }, [toast]);

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-neon-blue" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Quick Trade
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Select Asset</label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="border-border bg-secondary text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {assets.map((asset) => {
                  const locked = !isAssetUnlocked(asset);
                  return (
                    <SelectItem key={asset.id} value={asset.id} disabled={locked}>
                      <span className="flex items-center gap-2">
                        {asset.label}
                        {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        {asset.volatility === "high" && !locked && (
                          <span className="rounded bg-neon-red/10 px-1.5 py-0.5 text-[10px] font-bold text-neon-red">
                            HIGH RISK
                          </span>
                        )}
                        {locked && (
                          <span className="text-[10px] text-muted-foreground">
                            Lvl {asset.requiredLevel}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {!unlocked && currentAsset && (
            <div className="flex items-start gap-2 rounded-lg border border-neon-red/30 bg-neon-red/5 p-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-neon-red" />
              <p className="text-xs text-neon-red">
                This asset requires Level {currentAsset.requiredLevel}. Keep earning XP to unlock it!
              </p>
            </div>
          )}

          {unlocked && currentAsset?.volatility === "high" && (
            <div className="flex items-start gap-2 rounded-lg border border-neon-amber/30 bg-neon-amber/5 p-3 animate-slide-up">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neon-amber" />
              <p className="text-xs text-neon-amber">
                High-volatility asset. AI Risk-Brake is active and monitoring trading velocity.
              </p>
            </div>
          )}

          {currentAsset && (
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current Price</span>
                <span className="flex items-center gap-1 text-sm font-mono font-bold text-foreground">
                  <TrendingUp className="h-3 w-3 text-neon-green" />
                  ₹{currentAsset.price.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cash Available</span>
                <span className="text-sm font-mono text-foreground">₹{cashBalance.toLocaleString()}</span>
              </div>
            </div>
          )}

          {tradeCount > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">Trades this minute</span>
              <span className={`font-mono text-sm font-bold ${tradeCount >= NUDGE_THRESHOLD ? "text-neon-red text-glow-red" : "text-foreground"}`}>
                {tradeCount} / {FREEZE_THRESHOLD}
              </span>
            </div>
          )}

          <Button
            onClick={handleBuy}
            disabled={isFrozen || !unlocked}
            className={`w-full gap-2 text-base font-bold transition-all ${
              isFrozen
                ? "cursor-not-allowed border border-neon-red/30 bg-neon-red/10 text-neon-red opacity-60"
                : !unlocked
                ? "cursor-not-allowed border border-border bg-secondary text-muted-foreground opacity-50"
                : "bg-neon-blue text-primary-foreground glow-blue hover:bg-neon-blue/90"
            }`}
            size="lg"
          >
            {isFrozen ? (
              <><AlertTriangle className="h-4 w-4" /> TRADING LOCKED</>
            ) : !unlocked ? (
              <><Lock className="h-4 w-4" /> LOCKED</>
            ) : (
              <><Zap className="h-4 w-4" /> BUY</>
            )}
          </Button>

          <p className="text-center text-[10px] text-muted-foreground">
            {isFrozen
              ? "AI Risk-Brake engaged. Please wait for cool-down."
              : "Click rapidly to demo the AI Risk-Brake friction system"}
          </p>
        </div>
      </div>

      <CoolDownModal open={showModal} onComplete={handleCoolDownComplete} />
    </>
  );
};

export default QuickTrade;
