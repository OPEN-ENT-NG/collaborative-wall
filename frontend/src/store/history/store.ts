import { create } from "zustand";

import { HistoryAction, HistoryState, UpdateNote } from "~/models/store";

const MAX_HISTORY = 40;
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
            if (newStateWithId === state.present) {
              return state;
            }

            return {
              ...state,
              present: newStateWithId,
              // remove oldest entries
              past: [...state.past, newStateWithId].slice(-MAX_HISTORY),
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
          // remove newest entries
          future: [previousState, ...state.future].slice(0, MAX_HISTORY),
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
          // remove newest entries
          future: [existing, ...state.future].slice(0, MAX_HISTORY),
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
          // remove oldest entries
          past: [...state.past, nextState].slice(-MAX_HISTORY),
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
          // remove oldest entries
          past: [...state.past, existing].slice(-MAX_HISTORY),
          future: newFuture,
        };
      }),
  }),
);
