// src/features/fitness/store/activeWorkoutStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveWorkoutState {
  activeSessionId: string | null;
  workoutPlanId: string | null;
  startedAt: string | null;
  startSession: (sessionId: string, planId: string, startedAt: string) => void;
  clearSession: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      workoutPlanId: null,
      startedAt: null,

      startSession: (sessionId, planId, startedAt) =>
        set({
          activeSessionId: sessionId,
          workoutPlanId: planId,
          startedAt: startedAt,
        }),

      clearSession: () =>
        set({
          activeSessionId: null,
          workoutPlanId: null,
          startedAt: null,
        }),
    }),
    {
      name: "sb_active_workout", // Salva e recupera do localStorage automaticamente
    },
  ),
);
