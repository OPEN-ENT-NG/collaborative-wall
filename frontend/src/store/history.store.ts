import { create } from "zustand";

import { HistoryAction, HistoryState, UpdateNote } from "~/models/store";

const historyState = {
  past: [],
  present: null,
  future: [],
  updatedNote: undefined,
};

export const useHistoryStore = create<HistoryState & HistoryAction>((set) => ({
  ...historyState,
  setUpdatedNote: ({ activeId, x, y, zIndex }: UpdateNote) =>
    set(() => ({
      updatedNote: {
        activeId,
        x,
        y,
        zIndex,
      },
    })),
  setHistory: (newState) =>
    set((state) => {
      const newHistory = [...state.past, newState];

      if (newState === state.present) {
        return state;
      }

      return {
        ...state,
        present: newState,
        past: newHistory,
        future: [],
      };
    }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;

      const previousState = state.past[state.past.length - 1];
      const newHistory = state.past.slice(0, -1);

      return {
        ...state,
        present: previousState,
        past: newHistory,
        future: [previousState, ...state.future],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;

      const nextState = state.future[0];
      const newFuture = state.future.slice(1);

      return {
        ...state,
        present: nextState,
        past: [...state.past, nextState],
        future: newFuture,
      };
    }),
}));
