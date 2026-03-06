import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import CoolDownModal from "./CoolDownModal";
import { Zap, AlertTriangle, TrendingUp } from "lucide-react";

const assets = [
  { value: "nifty-etf", label: "Nifty 50 ETF", risk: "low" },
  { value: "reliance", label: "Reliance Industries", risk: "medium" },
  { value: "btc", label: "Bitcoin (BTC)", risk: "high" },
  { value: "doge", label: "Dogecoin (DOGE)", risk: "high" },
  { value: "nifty-options", label: "Nifty Options (CE)", risk: "high" },
];

const TRADE_WINDOW_MS = 60_000; // 1-minute window
const NUDGE_THRESHOLD = 3;
const FREEZE_THRESHOLD = 5;

const QuickTrade = () => {
  const [selectedAsset, setSelectedAsset] = useState("nifty-etf");
  const [isFrozen, setIsFrozen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tradeCount, setTradeCount] = useState(0);
  const tradeTimestamps = useRef<number[]>([]);
  const { toast } = useToast();

  const currentAsset = assets.find((a) => a.value === selectedAsset);
  const isHighRisk = currentAsset?.risk === "high";

  /** Core AI Risk-Brake logic */
  const handleBuy = useCallback(() => {
    if (isFrozen) return;

    const now = Date.now();
    // Keep only trades within the window
    tradeTimestamps.current = tradeTimestamps.current.filter(
      (t) => now - t < TRADE_WINDOW_MS
    );
    tradeTimestamps.current.push(now);
    const count = tradeTimestamps.current.length;
    setTradeCount(count);

    // Trigger 2: Hard freeze at 5 rapid trades
    if (count >= FREEZE_THRESHOLD) {
      setIsFrozen(true);
      setShowModal(true);
      return;
    }

    // Trigger 1: Nudge toast at 3 rapid trades
    if (count >= NUDGE_THRESHOLD) {
      toast({
        title: "⚠️ Hold up!",
        description: `You've made ${count} trades in 1 minute. Your estimated transaction costs are ₹${count * 50}. Consider your strategy.`,
        variant: "destructive",
        duration: 5000,
      });
    }

    // Visual feedback for successful trade
    if (count < NUDGE_THRESHOLD) {
      toast({
        title: "✅ Trade Executed",
        description: `Bought ${currentAsset?.label} successfully.`,
        duration: 2000,
      });
    }
  }, [isFrozen, toast, currentAsset]);

  /** Reset after cool-down */
  const handleCoolDownComplete = useCallback(() => {
    setShowModal(false);
    setIsFrozen(false);
    setTradeCount(0);
    tradeTimestamps.current = [];
    toast({
      title: "🟢 Trading Resumed",
      description: "Cool-down complete. Trade responsibly.",
      duration: 3000,
    });
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

        {/* Asset selector */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Select Asset
            </label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="border-border bg-secondary text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {assets.map((asset) => (
                  <SelectItem key={asset.value} value={asset.value}>
                    <span className="flex items-center gap-2">
                      {asset.label}
                      {asset.risk === "high" && (
                        <span className="rounded bg-neon-red/10 px-1.5 py-0.5 text-[10px] font-bold text-neon-red">
                          HIGH RISK
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Risk warning for high-risk assets */}
          {isHighRisk && (
            <div className="flex items-start gap-2 rounded-lg border border-neon-amber/30 bg-neon-amber/5 p-3 animate-slide-up">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neon-amber" />
              <p className="text-xs text-neon-amber">
                This is a high-volatility asset. GuardRail's AI Risk-Brake is active and monitoring your trading velocity.
              </p>
            </div>
          )}

          {/* Mock price */}
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Price</span>
              <span className="flex items-center gap-1 text-sm font-mono font-bold text-foreground">
                <TrendingUp className="h-3 w-3 text-neon-green" />
                ₹{isHighRisk ? "4,52,300" : "23,150"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Qty</span>
              <span className="text-sm font-mono text-foreground">1</span>
            </div>
          </div>

          {/* Trade velocity indicator */}
          {tradeCount > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">Trades this minute</span>
              <span
                className={`font-mono text-sm font-bold ${
                  tradeCount >= NUDGE_THRESHOLD ? "text-neon-red text-glow-red" : "text-foreground"
                }`}
              >
                {tradeCount} / {FREEZE_THRESHOLD}
              </span>
            </div>
          )}

          {/* BUY Button */}
          <Button
            onClick={handleBuy}
            disabled={isFrozen}
            className={`w-full gap-2 text-base font-bold transition-all ${
              isFrozen
                ? "cursor-not-allowed border border-neon-red/30 bg-neon-red/10 text-neon-red opacity-60"
                : "bg-neon-blue text-primary-foreground glow-blue hover:bg-neon-blue/90"
            }`}
            size="lg"
          >
            {isFrozen ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                TRADING LOCKED
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                BUY
              </>
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
