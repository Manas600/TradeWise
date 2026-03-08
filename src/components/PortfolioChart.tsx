import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MarketAsset } from "@/hooks/useGameState";

interface Props {
  assets: MarketAsset[];
  month: number;
}

const PortfolioChart = ({ assets, month }: Props) => {
  // 1. DEFENSIVE CHECK: If assets are undefined or empty, show a loading/empty state
  if (!assets || assets.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">Initializing market data...</p>
      </div>
    );
  }

  // 2. DATA TRANSFORMATION: Convert our priceHistory arrays into the format Recharts needs
  // We look at the first asset to see how many months of history we have
  const historyLength = assets[0]?.priceHistory?.length || 1;

  const chartData = Array.from({ length: historyLength }).map((_, index) => {
    const dataPoint: any = { monthLabel: `M${index}` };

    // Safely map each asset's price at this specific month index
    assets.forEach((asset) => {
      dataPoint[asset.label] = asset.priceHistory?.[index] || asset.basePrice;
    });

    return dataPoint;
  });

  // Theme colors for our 3 assets
  const colors = ["#00f0ff", "#39ff14", "#ff003c"]; // Neon Blue, Neon Green, Neon Red

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold">Market Performance</h3>
        <p className="text-sm text-muted-foreground">Asset price trends over {month} simulated months.</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              stroke="#888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

            {/* Dynamically generate a line for every asset that exists */}
            {assets.map((asset, index) => (
              <Line
                key={asset.id}
                type="monotone"
                dataKey={asset.label}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
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