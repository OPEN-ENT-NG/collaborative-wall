import { ID } from "edifice-ts-client";

import { NoteMedia } from "./noteMedia";
import { NoteProps } from "./notes";

/* History Store */
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

/* Whiteboard Store */
type Offset = {
  x: number;
  y: number;
};

export type State = {
  isMobile: boolean;
  canMoveBoard: boolean;
  canMoveNote: boolean;
  canZoom: boolean;
  isDragging: boolean;
  startPosition: Offset;
  offset: Offset;
  zoom: number;
  openShareModal: boolean;
  openUpdateModal: boolean;
  openCreateModal: boolean;
  openDescriptionModal: boolean;
  openBackgroundModal: boolean;
  positionViewport: Offset;
  numberOfNotes: number;
};

export type Action = {
  toggleCanMoveBoard: () => void;
  toggleCanMoveNote: () => void;
  setCanMoveBoard: (value: boolean) => void;
  setCanMoveNote: (value: boolean) => void;
  setZoom: (value: number) => void;
  setNumberOfNotes: (value: number) => void;
  setIsMobile: (query: string | null) => void;
  setOpenShareModal: (value: boolean) => void;
  setOpenUpdateModal: (value: boolean) => void;
  setOpenCreateModal: (value: boolean) => void;
  setOpenDescriptionModal: (value: boolean) => void;
  setIsOpenBackgroundModal: (value: boolean) => void;
  setPositionViewport: (value: { x: number; y: number }) => void;
};
