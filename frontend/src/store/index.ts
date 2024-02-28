import { create } from "zustand";

import { OFFSET, zoomConfig } from "~/config/init-config";

type Offset = {
  x: number;
  y: number;
};

type State = {
  isMobile: boolean;
  canMoveBoard: boolean;
  canMoveNote: boolean;
  canZoom: boolean;
  isDragging: boolean;
  startPosition: Offset;
  offset: Offset;
  zoom: number;
  openShareModal: boolean;
};

type Action = {
  toggleCanMoveBoard: () => void;
  toggleCanMoveNote: () => void;
  setCanMoveBoard: (value: boolean) => void;
  setCanMoveNote: (value: boolean) => void;
  setZoom: (value: number) => void;
  setIsMobile: (query: string | null) => void;
  setOpenShareModal: (value: boolean) => void;
};

const initialState = {
  isMobile: false,
  canMoveBoard: false,
  canMoveNote: true,
  canZoom: true,
  isDragging: false,
  startPosition: OFFSET,
  offset: OFFSET,
  zoom: zoomConfig.DEFAULT_ZOOM,
  openShareModal: false,
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
  setOpenShareModal: (value: boolean) => set({ openShareModal: value }),
}));
