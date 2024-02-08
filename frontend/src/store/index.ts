import { create } from "zustand";

import { initialState } from "~/config/init-config";
import { NoteProps } from "~/services/api";

type Offset = {
  x: number;
  y: number;
};

type State = {
  canMoveBoard: boolean;
  canMoveNote: boolean;
  canZoom: boolean;
  isDragging: boolean;
  startPosition: Offset;
  offset: Offset;
  zoom: number;
  notes?: NoteProps[];
};

type Action = {
  toggleCanMoveBoard: () => void;
  toggleCanMoveNote: () => void;
  setCanMoveBoard: (value: boolean) => void;
  setCanMoveNote: (value: boolean) => void;
  setNotes: (value: NoteProps[]) => void;
  setZoom: (value: number) => void;
  updateNotePosition: ({
    activeId,
    x,
    y,
  }: {
    activeId: string;
    x: number;
    y: number;
  }) => void;
  /* createNote: () => void;
  deleteNote: (id: string | number) => void; */
};

export const useWhiteboard = create<State & Action>((set) => ({
  ...initialState,
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
  setNotes: (value: NoteProps[]) => set({ notes: value }),
  setZoom: (value: number) => set({ zoom: value }),
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
  /* createNote: () => {
      const notes = get().notes;
      const notesSize = notes.length ?? ;
      const nextId = notesSize + 1;

      const whiteboard = document.querySelector(".whiteboard");
      const whiteboardWidth = whiteboard ? whiteboard.clientWidth : 0;
      const whiteboardHeight = whiteboard ? whiteboard.clientHeight : 0;

      const x = (whiteboardWidth - 224) / 2;
      const y = (whiteboardHeight - 224) / 2;

      const newNote = {
        id: nextId,
        title: `note ${nextId}`,
        text: `lorem ipsum lorem ipsum${nextId}`,
        offset: { x, y },
        zIndex: nextId,
      };

      set((state: { notes: NoteProps[] }) => ({
        notes: [...state.notes, newNote],
      }));
    },
    deleteNote: (id: string | number) => {
      set((state: { notes: NoteProps[] }) => ({
        notes: state.notes.filter((note) => note._id !== id),
      }));
    }, */
}));
