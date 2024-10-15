import { ID } from 'edifice-ts-client';
import { MediaProps } from '~/models/media';
import { NoteProps } from '~/models/notes';

import { ActionData } from '~/store/websocket/types';

/* History Store */
export type UpdatedNote =
  | {
      activeId: ID;
      x: number;
      y: number;
      zIndex: number;
    }
  | undefined;

export type HistoryState = {
  past: NewState[];
  present: NewState | null;
  future: NewState[];
  updatedNote: UpdatedNote;
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
  media?: MediaProps | null;
};

export type NewState = {
  id: string;
  type: string;
  item: NoteProps;
  previous?: NoteState;
  next?: NoteState;
};

export type HistoryAction = {
  setHistory: (newState: Omit<NewState, 'id'> & ActionData) => void;
  undo: () => void;
  redo: () => void;
  undoById: (id: string) => void;
  redoById: (id: string) => void;
};
