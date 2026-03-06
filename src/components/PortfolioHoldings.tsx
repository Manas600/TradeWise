import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { MarketAsset, Holding } from "@/hooks/useGameState";

interface Props {
  portfolio: Holding[];
  assets: MarketAsset[];
  onSell: (assetId: string) => void;
}

const PortfolioHoldings = ({ portfolio, assets, onSell }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Your Holdings
      </h2>
      <div className="space-y-3">
        {portfolio.map((h) => {
          const asset = assets.find((a) => a.id === h.assetId);
          if (!asset) return null;
          const currentValue = asset.price * h.qty;
          const costBasis = h.avgCost * h.qty;
          const pnl = currentValue - costBasis;
          const pnlPct = ((pnl) / costBasis) * 100;
          const isProfit = pnl >= 0;

          return (
            <div key={h.assetId} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
              <div>
                <p className="font-semibold text-sm text-foreground">{asset.label}</p>
                <p className="text-xs text-muted-foreground">
                  {h.qty} unit{h.qty > 1 ? "s" : ""} · Avg ₹{h.avgCost.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-foreground">₹{currentValue.toLocaleString()}</p>
                  <p className={`flex items-center gap-1 text-xs font-mono ${isProfit ? "text-neon-green" : "text-neon-red"}`}>
                    {isProfit ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {isProfit ? "+" : ""}{pnlPct.toFixed(1)}%
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSell(h.assetId)}
                  className="border-neon-red/30 text-neon-red hover:bg-neon-red/10 hover:text-neon-red"
                >
                  SELL
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioHoldings;
