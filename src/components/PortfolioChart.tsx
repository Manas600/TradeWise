import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MarketAsset } from "@/hooks/useGameState";

interface Props {
  assets: MarketAsset[];
  month: number;
}

const COLORS: Record<string, string> = {
  "nifty-etf": "hsl(142, 71%, 45%)",
  bluechip: "hsl(210, 100%, 55%)",
  "fo-crypto": "hsl(0, 85%, 55%)",
};

const PortfolioChart = ({ assets = [], month }: Props) => {
  if (!assets || assets.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Market Prices</h2>
        <p className="mt-2 text-xs text-muted-foreground">No market data yet. Click "Simulate 1 Month" to begin.</p>
      </div>
    );
  }
  const maxLen = Math.max(...assets.map((a) => a.priceHistory.length));
  const data = Array.from({ length: maxLen }, (_, i) => {
    const point: Record<string, string | number> = { month: `M${i}` };
    assets.forEach((a) => {
      if (i < a.priceHistory.length) {
        point[a.id] = a.priceHistory[i];
      }
    });
    return point;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Market Prices
          </h2>
          <p className="text-xs text-muted-foreground">
            Simulated over {month} month{month !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            {assets.map((a) => (
              <linearGradient key={a.id} id={`grad-${a.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS[a.id]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS[a.id]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "hsl(215, 12%, 55%)" }}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "hsl(228, 15%, 14%)",
              border: "1px solid hsl(228, 12%, 18%)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(210, 20%, 92%)",
            }}
            formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          {assets.map((a) => (
            <Area
              key={a.id}
              type="monotone"
              dataKey={a.id}
              name={a.label}
              stroke={COLORS[a.id]}
              strokeWidth={2}
              fill={`url(#grad-${a.id})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
