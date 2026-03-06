import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShieldAlert } from "lucide-react";

interface CoolDownModalProps {
  open: boolean;
  onComplete: () => void;
}

/** 
 * Full-screen modal with a 15-second mock countdown.
 * In production this would be 15 minutes — shortened for demo purposes.
 */
const CoolDownModal = ({ open, onComplete }: CoolDownModalProps) => {
  const TOTAL_SECONDS = 15; // short for demo
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (!open) {
      setSeconds(TOTAL_SECONDS);
      return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, onComplete]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((TOTAL_SECONDS - seconds) / TOTAL_SECONDS) * 100;

  return (
    <Dialog open={open}>
      <DialogContent
        className="border-neon-red/40 bg-card glow-red sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          {/* Animated shield icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-neon-red/50 bg-neon-red/10 animate-pulse-glow">
            <ShieldAlert className="h-10 w-10 text-neon-red" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">
              AI Risk-Brake <span className="text-neon-red text-glow-red">Engaged</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              High-velocity trading pattern detected.<br />
              Take a breath. Trading is locked for a cool-down period.
            </p>
          </div>

          {/* Countdown timer */}
          <div className="font-mono text-5xl font-bold tracking-widest text-neon-red text-glow-red">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-neon-red transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Cool-down in progress — demo mode (15s)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoolDownModal;
