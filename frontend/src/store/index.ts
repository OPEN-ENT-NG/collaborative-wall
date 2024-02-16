import { create } from "zustand";

import { OFFSET, zoomConfig } from "~/config/init-config";
import { NoteProps } from "~/models/notes";

type Offset = {
  x: number;
  y: number;
};

type State = {
  notes: NoteProps[];
  isMobile: boolean;
  canMoveBoard: boolean;
  canMoveNote: boolean;
  canZoom: boolean;
  isDragging: boolean;
  startPosition: Offset;
  offset: Offset;
  zoom: number;
};

type Action = {
  toggleCanMoveBoard: () => void;
  toggleCanMoveNote: () => void;
  setCanMoveBoard: (value: boolean) => void;
  setCanMoveNote: (value: boolean) => void;
  setZoom: (value: number) => void;
  setNotes: (notes: NoteProps[]) => void;
  setIsMobile: (query: string | null) => void;
  updateNotePosition: ({
    activeId,
    x,
    y,
  }: {
    activeId: string;
    x: number;
    y: number;
  }) => void;
};

const initialState = {
  notes: [],
  isMobile: false,
  canMoveBoard: false,
  canMoveNote: false,
  canZoom: true,
  isDragging: false,
  startPosition: OFFSET,
  offset: OFFSET,
  zoom: zoomConfig.DEFAULT_ZOOM,
};

export const useWhiteboard = create<State & Action>((set) => ({
  ...initialState,
  setIsMobile: (query) => set({ isMobile: query === "mobile" }),
  toggleCanMoveBoard: () =>
    set((state: { canMoveBoard: boolean }) => ({
      canMoveBoard: !state.canMoveBoard,
    })),
  toggleCanMoveNote: () =>
    set((state: { canMoveNote: boolean }) => ({
      canMoveNote: !state.canMoveNote,
    })),
  setCanMoveBoard: (value: boolean) => set({ canMoveBoard: value }),
  setCanMoveNote: (value: boolean) => set({ canMoveNote: value }),
  setZoom: (value: number) => set({ zoom: value }),
  setNotes: (notes: NoteProps[]) => set({ notes }),
  updateNotePosition: ({
    activeId,
    y,
    x,
  }: {
    activeId: string;
    x: number;
    y: number;
  }) => {
    set((state: State): Partial<State> => {
      const updatedNotes = state.notes?.map((note) => {
        if (note._id === activeId) {
          return {
            ...note,
            x: note.x + x,
            y: note.y + y,
            zIndex: 2,
          };
        }
        return {
          ...note,
          zIndex: 1,
        };
      });

      return {
        ...state,
        notes: updatedNotes,
      };
    });
  },
}));
