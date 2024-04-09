import { ID } from "edifice-ts-client";

import { NoteMedia } from "../../models/noteMedia";
import { NoteProps } from "../../models/notes";

export type HistoryState = {
  past: NewState[];
  present: NewState | null;
  future: NewState[];
  updatedNote:
    | {
        activeId: ID;
        x: number;
        y: number;
        zIndex: number;
      }
    | undefined;
};

export type UpdateNote = {
  activeId: ID;
  x: number;
  y: number;
  zIndex: number;
};

type NoteState = {
  x: number;
  y: number;
  color?: string[];
  content?: string;
  media?: NoteMedia | null;
};

export type NewState = {
  type: string;
  item: NoteProps;
  previous?: NoteState;
  next?: NoteState;
};

export type HistoryAction = {
  setUpdatedNote: ({ activeId, x, y, zIndex }: UpdateNote) => void;
  setHistory: (newState: NewState) => void;
  undo: () => void;
  redo: () => void;
};
