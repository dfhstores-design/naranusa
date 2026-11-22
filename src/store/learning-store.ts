"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LearningState = {
  xp: number;
  stars: number;
  streak: number;
  answered: Record<string, boolean>;
  recordAnswer: (questionId: string, isCorrect: boolean) => void;
  resetDemoProgress: () => void;
};

const startingState = {
  xp: 120,
  stars: 7,
  streak: 4,
  answered: {} as Record<string, boolean>,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      ...startingState,
      recordAnswer: (questionId, isCorrect) =>
        set((state) => {
          const alreadyCorrect = state.answered[questionId] === true;
          const nextAnswered = { ...state.answered, [questionId]: isCorrect || alreadyCorrect };
          if (!isCorrect || alreadyCorrect) return { answered: nextAnswered };
          return { answered: nextAnswered, xp: state.xp + 10, stars: state.stars + 1 };
        }),
      resetDemoProgress: () => set({ ...startingState }),
    }),
    {
      name: "naranusa-learning-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        xp: state.xp,
        stars: state.stars,
        streak: state.streak,
        answered: state.answered,
      }),
    },
  ),
);
