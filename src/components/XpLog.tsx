import type { XpLogEntry } from "@/hooks/useGameState";
import { History, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  logs: XpLogEntry[];
}

const XpLog = ({ logs }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-4 w-4 text-neon-blue" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Action Log
        </h2>
      </div>

      <div className="h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">
              No actions recorded yet. Buy an asset and simulate time to earn XP.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm animate-in slide-in-from-top-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${log.type === "gain" ? "bg-neon-green/10" : "bg-neon-red/10"}`}>
                    {log.type === "gain" ? (
                      <ArrowUpRight className="h-3 w-3 text-neon-green" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-neon-red" />
                    )}
                  </div>
                  <span className="text-foreground">{log.reason}</span>
                </div>
                <span className={`font-mono font-bold ${log.type === "gain" ? "text-neon-green" : "text-neon-red"}`}>
                  {log.type === "gain" ? "+" : "-"}{log.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default XpLog;