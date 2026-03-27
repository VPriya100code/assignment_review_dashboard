import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface DeadlineCountdownProps {
  dueDate: string;
  submitted?: boolean;
}

export function DeadlineCountdown({ dueDate, submitted }: DeadlineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgency, setUrgency] = useState<"safe" | "warning" | "danger" | "passed">("safe");

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const due = new Date(dueDate).getTime();
      const diff = due - now;

      if (diff <= 0) {
        setTimeLeft("Past due");
        setUrgency("passed");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 3) {
        setTimeLeft(`${days}d ${hours}h`);
        setUrgency("safe");
      } else if (days >= 1) {
        setTimeLeft(`${days}d ${hours}h`);
        setUrgency("warning");
      } else {
        setTimeLeft(`${hours}h ${minutes}m`);
        setUrgency("danger");
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [dueDate]);

  if (submitted) return null;

  const colorMap = {
    safe: "text-muted-foreground",
    warning: "text-warning",
    danger: "text-destructive font-semibold",
    passed: "text-destructive",
  };

  return (
    <span className={`flex items-center gap-1 text-xs ${colorMap[urgency]}`}>
      <Clock className="h-3.5 w-3.5" />
      {timeLeft}
    </span>
  );
}
