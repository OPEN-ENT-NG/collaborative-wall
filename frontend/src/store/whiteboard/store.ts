import { create } from "zustand";
import { Action, State } from "./types";

const initialState = {
  isMobile: false,
  canMoveBoard: true,
  canMoveNote: true,
  isDragging: false,
  dropdownState: {
    isOpen: false,
    idDropdown: "",
  },
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

export const useWhiteboardStore = create<State & Action>((set) => ({
  ...initialState,
  setIsMobile: (query) => set({ isMobile: query === "mobile" }),
  toggleCanMoveBoard: () =>
    set((state) => ({
      canMoveBoard: !state.canMoveBoard,
    })),
  toggleCanMoveNote: () =>
    set((state) => ({
      canMoveNote: !state.canMoveNote,
    })),
  setCanMoveBoard: (value) => set({ canMoveBoard: value }),
  setCanMoveNote: (value) => set({ canMoveNote: value }),
  setOpenShareModal: (value) => set({ openShareModal: value }),
  setOpenUpdateModal: (value) => set({ openUpdateModal: value }),
  setOpenCreateModal: (value) => set({ openCreateModal: value }),
  setNumberOfNotes: (value: number) => set({ numberOfNotes: value }),
  setOpenDescriptionModal: (value) => set({ openDescriptionModal: value }),
  setIsOpenBackgroundModal: (value) => set({ openBackgroundModal: value }),
  setDropdownState: (value: { isOpen: boolean; idDropdown: string }) =>
    set({ dropdownState: value }),
  setPositionViewport: (value: { x: number; y: number }) =>
    set({ positionViewport: value }),
}));
