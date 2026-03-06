import FMIHeader from "@/components/FMIHeader";
import GamifiedStaircase from "@/components/GamifiedStaircase";
import PortfolioChart from "@/components/PortfolioChart";
import QuickTrade from "@/components/QuickTrade";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <FMIHeader
        score={450}
        maxScore={1000}
        level="Level 1"
        levelName="The Owner"
      />

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Staircase + Chart */}
          <div className="space-y-6 lg:col-span-2">
            <GamifiedStaircase />
            <PortfolioChart />
          </div>

          {/* Right column: Quick Trade */}
          <div>
            <QuickTrade />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
