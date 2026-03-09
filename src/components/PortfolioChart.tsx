import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MarketAsset } from "@/hooks/useGameState";

interface Props {
  assets: MarketAsset[];
  month: number;
}

// 1. UNIQUE COLORS: Mapping each specific asset ID to a distinct, neon dark-mode color.
const ASSET_COLORS: Record<string, string> = {
  "nifty-etf": "#00f0ff",     // Neon Cyan (Safe)
  "sgb": "#FFD700",           // Gold (Safe)
  "largecap": "#39ff14",      // Neon Green (Moderate)
  "midcap": "#B388FF",        // Neon Purple (Moderate)
  "smallcap": "#FF9100",      // Neon Orange (High Risk)
  "fo-crypto": "#ff003c"      // Neon Red (Extreme Risk)
};

const PortfolioChart = ({ assets, month }: Props) => {
  if (!assets || assets.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">Initializing market data...</p>
      </div>
    );
  }

  const historyLength = assets[0]?.priceHistory?.length || 1;

  // 2. NORMALIZE TO PERCENTAGE: Instead of raw rupees, we chart the % change from Month 0.
  const chartData = Array.from({ length: historyLength }).map((_, index) => {
    const dataPoint: any = { monthLabel: `M${index}` };

    assets.forEach((asset) => {
      const basePrice = asset.priceHistory[0] || asset.basePrice;
      const currentPrice = asset.priceHistory?.[index] || asset.basePrice;

      // Calculate % return: ((Current - Base) / Base) * 100
      const percentChange = ((currentPrice - basePrice) / basePrice) * 100;
      dataPoint[asset.id] = parseFloat(percentChange.toFixed(2));
    });

    return dataPoint;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold">Market Performance (% Return)</h3>
        <p className="text-sm text-muted-foreground">Compare asset volatility and cumulative growth.</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />

            <XAxis
              dataKey="monthLabel"
              stroke="#888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            {/* 3. Y-AXIS FORMATTING: Now shows percentages with + and - signs */}
            <YAxis
              stroke="#888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
            />

            {/* 4. CUSTOM TOOLTIP: Makes reading the hovered data much cleaner */}
            <Tooltip
              contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
              itemStyle={{ fontWeight: 'bold' }}
              formatter={(value: number, name: string) => {
                const assetLabel = assets.find(a => a.id === name)?.label || name;
                return [`${value > 0 ? '+' : ''}${value}%`, assetLabel];
              }}
              labelFormatter={(label) => `Month ${label.replace('M', '')}`}
            />

            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              formatter={(value) => assets.find(a => a.id === value)?.label || value}
            />

            {/* Draw lines using the specific colors we defined at the top */}
            {assets.map((asset) => (
              <Line
                key={asset.id}
                type="monotone"
                dataKey={asset.id} // We use the ID as the dataKey now to map the colors
                name={asset.id}
                stroke={ASSET_COLORS[asset.id] || "#fff"}
                strokeWidth={asset.volatility === 'extreme' ? 3 : 2} // Make extreme risk slightly thicker
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioChart;