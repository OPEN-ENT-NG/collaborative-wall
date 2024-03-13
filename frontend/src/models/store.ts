import { ID } from "edifice-ts-client";

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

export type HistoryPosition = {
  previous: {
    x: number;
    y: number;
  };
  next: {
    x: number;
    y: number;
  };
};

export type NewState = {
  type: string;
  item: NoteProps;
  positions?: HistoryPosition;
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
  openCreateModal: boolean;
  openDescriptionModal: boolean;
  positionViewport: Offset;
};

export type Action = {
  toggleCanMoveBoard: () => void;
  toggleCanMoveNote: () => void;
  setCanMoveBoard: (value: boolean) => void;
  setCanMoveNote: (value: boolean) => void;
  setZoom: (value: number) => void;
  setIsMobile: (query: string | null) => void;
  setOpenShareModal: (value: boolean) => void;
  setOpenCreateModal: (value: boolean) => void;
  setOpenDescriptionModal: (value: boolean) => void;
  setPositionViewport: (value: { x: number; y: number }) => void;
};
