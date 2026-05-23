// src/features/fitness/components/ActiveWorkoutTimer.tsx

"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ActiveWorkoutTimerProps {
  startedAt: string;
}

export function ActiveWorkoutTimer({ startedAt }: ActiveWorkoutTimerProps) {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  useEffect(() => {
    const startTime = new Date(startedAt).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - startTime;

      if (diff <= 0) {
        setElapsedTime("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (num: number) => String(num).padStart(2, "0");

      setElapsedTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 rounded-2xl text-purple-400 font-semibold text-sm sm:text-base shadow-sm">
      <Clock className="w-4 h-4 animate-pulse" />
      <span>{elapsedTime}</span>
    </div>
  );
}
