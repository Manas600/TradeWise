import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import type { MarketAsset, Holding } from "@/hooks/useGameState";

interface Props {
  portfolio: Holding[];
  assets: MarketAsset[];
  onSell: (assetId: string) => void;
}

const PortfolioHoldings = ({ portfolio, assets, onSell }: Props) => {
  // If the user hasn't bought anything yet, show a nice empty state
  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <Wallet className="h-10 w-10 opacity-20" />
        <div>
          <p className="font-semibold text-foreground">Your Portfolio is Empty</p>
          <p className="text-sm">Use the Quick Trade panel to buy your first asset.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Current Holdings</h3>
          <p className="text-sm text-muted-foreground">Manage your assets and track returns.</p>
        </div>
      </div>

      <div className="space-y-4">
        {portfolio.map((holding) => {
          // Find the live market data for this specific holding
          const asset = assets.find((a) => a.id === holding.assetId);
          if (!asset) return null;

          const totalCost = holding.qty * holding.avgCost;
          const currentValue = holding.qty * asset.price;
          const profit = currentValue - totalCost;
          const profitPct = (profit / totalCost) * 100;
          const isAtLoss = profit < 0;

          return (
            <div 
              key={holding.assetId} 
              className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-secondary/20 p-4 sm:flex-row sm:items-center"
            >
              {/* Asset Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground">{asset.label}</h4>
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    Qty: {holding.qty}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Avg Cost: <span className="font-mono text-foreground">₹{holding.avgCost.toLocaleString()}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Current: <span className="font-mono text-foreground">₹{asset.price.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Performance & Actions */}
              <div className="flex items-center justify-between gap-6 sm:justify-end">
                <div className="text-right">
                  <p className={`flex items-center justify-end gap-1 font-mono font-bold ${isAtLoss ? "text-neon-red" : "text-neon-green"}`}>
                    {isAtLoss ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    ₹{Math.abs(profit).toLocaleString()}
                  </p>
                  <p className={`text-xs ${isAtLoss ? "text-neon-red/70" : "text-neon-green/70"}`}>
                    {isAtLoss ? "" : "+"}{profitPct.toFixed(2)}%
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    onClick={() => onSell(holding.assetId)}
                    variant="outline"
                    size="sm"
                    className={`border-border transition-colors ${
                      isAtLoss 
                        ? "hover:bg-neon-red/20 hover:text-neon-red" 
                        : "hover:bg-neon-green/20 hover:text-neon-green"
                    }`}
                  >
                    Sell 1x
                  </Button>
                  {isAtLoss && (
                    <span className="flex items-center gap-1 text-[10px] text-neon-red">
                      <AlertCircle className="h-3 w-3" /> -20 XP Penalty
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioHoldings;