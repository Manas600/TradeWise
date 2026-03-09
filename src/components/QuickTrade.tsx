import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import CoolDownModal from "./CoolDownModal";
import { Zap, AlertTriangle, TrendingUp, Lock, BrainCircuit, Activity } from "lucide-react";
import type { MarketAsset } from "@/hooks/useGameState";

interface Props {
  assets: MarketAsset[];
  currentLevel: number;
  isAssetUnlocked: (asset: MarketAsset) => boolean;
  onBuy: (assetId: string) => boolean;
  cashBalance: number;
  month: number; // We now track the month to reset the AI memory
}

const QuickTrade = ({ assets = [], currentLevel, isAssetUnlocked, onBuy, cashBalance, month }: Props) => {
  const firstUnlocked = assets.find((a) => isAssetUnlocked(a));
  const [selectedAsset, setSelectedAsset] = useState(firstUnlocked?.id ?? assets[0]?.id ?? "");
  const [isFrozen, setIsFrozen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // The new AI Risk Engine State (0 to 100)
  const [aiRiskScore, setAiRiskScore] = useState(0);
  const { toast } = useToast();

  const currentAsset = assets.find((a) => a.id === selectedAsset);
  const unlocked = currentAsset ? isAssetUnlocked(currentAsset) : false;

  // 1. TIME SYNC: Reset the AI Risk Score when a virtual month passes
  useEffect(() => {
    setAiRiskScore(0);
  }, [month]);

  // 2. REAL-TIME COOLING: The AI lowers your risk score slowly if you stop trading
  useEffect(() => {
    if (aiRiskScore > 0 && !isFrozen) {
      const timer = setInterval(() => {
        setAiRiskScore((prev) => Math.max(0, prev - 5)); // Cool down by 5 points every 2 seconds
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [aiRiskScore, isFrozen]);

  const handleBuy = useCallback(() => {
    if (isFrozen || !currentAsset || !unlocked) return;

    // 3. DYNAMIC RISK EVALUATION: Penalty is based on asset volatility
    let riskPenalty = 0;
    switch (currentAsset.volatility) {
      case "low": riskPenalty = 10; break;      // Safe: takes 10 rapid clicks to trigger brake
      case "medium": riskPenalty = 25; break;   // Moderate: takes 4 clicks
      case "high": riskPenalty = 45; break;     // Risky: takes 3 clicks
      case "extreme": riskPenalty = 65; break;  // Extreme: takes 2 clicks to trigger the brake!
    }

    const newRiskScore = aiRiskScore + riskPenalty;
    setAiRiskScore(newRiskScore);

    // If score breaches 100, slam the brakes BEFORE the trade executes
    if (newRiskScore >= 100) {
      setIsFrozen(true);
      setShowModal(true);
      return; 
    }

    // Nudge the user if they are getting close to the limit
    if (newRiskScore >= 75) {
      toast({
        title: "⚠️ AI Intervention Imminent",
        description: "Erratic, high-risk trading pattern detected. Slow down.",
        variant: "destructive",
        duration: 3000,
      });
    }

    // Execute the trade if the brake didn't hit
    const success = onBuy(selectedAsset);
    if (success && newRiskScore < 75) {
      toast({
        title: "✅ Trade Executed",
        description: `Bought 1x ${currentAsset.label} at ₹${currentAsset.price.toLocaleString()}.`,
        duration: 2000,
      });
    }
  }, [isFrozen, toast, currentAsset, unlocked, onBuy, selectedAsset, aiRiskScore]);

  const handleCoolDownComplete = useCallback(() => {
    setShowModal(false);
    setIsFrozen(false);
    setAiRiskScore(0); // Wipe the slate clean after punishment
    toast({ title: "🟢 Trading Resumed", description: "Cool-down complete. Trade responsibly.", duration: 3000 });
  }, [toast]);

  // Visual helper for the Risk Bar color
  const getRiskColor = () => {
    if (aiRiskScore >= 75) return "bg-neon-red shadow-[0_0_10px_rgba(255,0,60,0.5)]";
    if (aiRiskScore >= 40) return "bg-neon-amber shadow-[0_0_10px_rgba(255,176,0,0.5)]";
    return "bg-neon-green";
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-neon-blue" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Quick Trade
            </h2>
          </div>
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
                        {asset.volatility === "extreme" && !locked && (
                          <span className="rounded bg-neon-red/10 px-1.5 py-0.5 text-[10px] font-bold text-neon-red">
                            MAX RISK
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
                Requires Level {currentAsset.requiredLevel}. Keep earning XP!
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

          {/* THE NEW AI RISK MONITOR UI */}
          <div className="rounded-lg border border-border/50 bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <BrainCircuit className={`h-3.5 w-3.5 ${aiRiskScore > 0 ? "text-neon-blue animate-pulse" : ""}`} />
                AI Risk Monitor
              </span>
              <span className={`text-xs font-mono font-bold ${aiRiskScore >= 75 ? "text-neon-red animate-pulse" : "text-foreground"}`}>
                {aiRiskScore}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className={`h-full transition-all duration-300 ease-out ${getRiskColor()}`}
                style={{ width: `${Math.min(100, aiRiskScore)}%` }}
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-wider">
              <Activity className="h-3 w-3" /> 
              {aiRiskScore === 0 ? "Monitoring trade velocity..." : 
               aiRiskScore < 50 ? "Normal activity detected." : 
               aiRiskScore < 75 ? "Elevated risk velocity." : 
               "CRITICAL: Intervention Imminent"}
            </p>
          </div>

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
              <><Zap className="h-4 w-4" /> BUY {currentAsset?.label}</>
            )}
          </Button>
        </div>
      </div>

      <CoolDownModal open={showModal} onComplete={handleCoolDownComplete} />
    </>
  );
};

export default QuickTrade;