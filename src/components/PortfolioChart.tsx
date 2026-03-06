import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", value: 10000 },
  { month: "Feb", value: 10250 },
  { month: "Mar", value: 10180 },
  { month: "Apr", value: 10520 },
  { month: "May", value: 10780 },
  { month: "Jun", value: 10650 },
  { month: "Jul", value: 11100 },
  { month: "Aug", value: 11400 },
  { month: "Sep", value: 11350 },
  { month: "Oct", value: 11800 },
  { month: "Nov", value: 12100 },
  { month: "Dec", value: 12450 },
];

const PortfolioChart = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Portfolio Growth
          </h2>
          <p className="text-2xl font-bold text-foreground">
            ₹12,450
            <span className="ml-2 text-sm font-medium text-neon-green">+24.5%</span>
          </p>
        </div>
        <span className="rounded-full bg-neon-green/10 px-3 py-1 text-xs font-semibold text-neon-green">
          Low Risk
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "hsl(215, 12%, 55%)" }}
          />
          <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
          <Tooltip
            contentStyle={{
              background: "hsl(228, 15%, 14%)",
              border: "1px solid hsl(228, 12%, 18%)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(210, 20%, 92%)",
            }}
            formatter={(value: number) => [`₹${value.toLocaleString()}`, "Value"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(210, 100%, 55%)"
            strokeWidth={2}
            fill="url(#portfolioGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
