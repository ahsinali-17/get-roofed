import { create } from "zustand";

interface SaveCountStore {
  saveCount: number;
  setSaveCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
}

export const useSaveCountStore = create<SaveCountStore>((set) => ({
  saveCount: 0,
  setSaveCount: (count) => set({ saveCount: count }),
  increment: () => set((state) => ({ saveCount: state.saveCount + 1 })),
  decrement: () =>
    set((state) => ({ saveCount: Math.max(0, state.saveCount - 1) })),
}));
