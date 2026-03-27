import { Flame, Trophy } from "lucide-react";
import type { StreakData } from "@/types";

interface StreakTrackerProps {
  streak: StreakData;
}

export function StreakTracker({ streak }: StreakTrackerProps) {
  return (
    <div className="glass-card rounded-lg p-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          streak.currentStreak > 0 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
        }`}>
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{streak.currentStreak}</p>
          <p className="text-xs text-muted-foreground">day streak</p>
        </div>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-semibold leading-none">{streak.longestStreak}</p>
          <p className="text-xs text-muted-foreground">best</p>
        </div>
      </div>
    </div>
  );
}
