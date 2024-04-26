import { create } from "zustand";
import { Action, State } from "./types";

const initialState = {
  isMobile: false,
  canMoveBoard: true,
  canMoveNote: true,
  isDragging: false,
  isOpenDropdown: false,
  openShareModal: false,
  openUpdateModal: false,
  openCreateModal: false,
  openDescriptionModal: false,
  openBackgroundModal: false,
  numberOfNotes: 0,
  positionViewport: {
    x: 0,
    y: 0,
  },
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
  setOpenShareModal: (value: boolean) => set({ openShareModal: value }),
  setOpenUpdateModal: (value: boolean) => set({ openUpdateModal: value }),
  setOpenCreateModal: (value: boolean) => set({ openCreateModal: value }),
  setNumberOfNotes: (value: number) => set({ numberOfNotes: value }),
  setOpenDescriptionModal: (value: boolean) =>
    set({ openDescriptionModal: value }),
  setIsOpenBackgroundModal: (value: boolean) =>
    set({ openBackgroundModal: value }),
  setIsOpenDropdown: (value: boolean) => set({ isOpenDropdown: value }),
  setPositionViewport: (value: { x: number; y: number }) =>
    set({ positionViewport: value }),
}));
