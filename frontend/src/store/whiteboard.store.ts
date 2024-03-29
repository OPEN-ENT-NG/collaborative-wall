import { create } from "zustand";

import { OFFSET, zoomConfig } from "~/config/init-config";
import { Action, State } from "~/models/store";

const initialState = {
  isMobile: false,
  canMoveBoard: true,
  canMoveNote: true,
  canZoom: true,
  isDragging: false,
  startPosition: OFFSET,
  offset: OFFSET,
  zoom: zoomConfig.DEFAULT_ZOOM,
  openShareModal: false,
  openUpdateModal: false,
  openCreateModal: false,
  openDescriptionModal: false,
  openBackgroundModal: false,
  positionViewport: {
    x: 0,
    y: 0,
  },
  numberOfNotes: 0,
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
  setOpenUpdateModal: (value: boolean) => set({ openUpdateModal: value }),
  setOpenCreateModal: (value: boolean) => set({ openCreateModal: value }),
  setNumberOfNotes: (value: number) => set({ numberOfNotes: value }),
  setOpenDescriptionModal: (value: boolean) =>
    set({ openDescriptionModal: value }),
  setIsOpenBackgroundModal: (value: boolean) =>
    set({ openBackgroundModal: value }),
  setPositionViewport: (value: { x: number; y: number }) =>
    set({ positionViewport: value }),
}));
