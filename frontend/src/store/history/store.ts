import { create } from "zustand";

import { HistoryAction, HistoryState, UpdateNote } from "~/models/store";

const historyState = {
  past: [],
  present: null,
  future: [],
  updatedNote: undefined,
};

export const useHistoryStore = create<HistoryState & HistoryAction>(
  (set, get) => ({
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
    setHistory: (newState) => {
      switch (newState.actionType) {
        case "Do": {
          set((state) => {
            const newStateWithId = { ...newState, id: newState.actionId };
            const newHistory = [...state.past, newStateWithId];

            if (newStateWithId === state.present) {
              return state;
            }

            return {
              ...state,
              present: newStateWithId,
              past: newHistory,
              future: [],
            };
          });
          break;
        }
        case "Redo": {
          const { redoById } = get();
          return redoById(newState.actionId);
        }
        case "Undo": {
          const { undoById } = get();
          return undoById(newState.actionId);
        }
      }
    },

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
    undoById: (id: string) =>
      set((state) => {
        const existing = state.past.find((value) => value.id === id);
        if (!existing) {
          return state;
        }

        const newPast = state.past.filter((value) => value.id !== id);
        return {
          ...state,
          present: existing,
          past: newPast,
          future: [existing, ...state.future],
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
    redoById: (id: string) =>
      set((state) => {
        const existing = state.future.find((value) => value.id === id);
        if (!existing) {
          return state;
        }

        const newFuture = state.future.filter((value) => value.id !== id);
        return {
          ...state,
          present: existing,
          past: [...state.past, existing],
          future: newFuture,
        };
      }),
  }),
);
