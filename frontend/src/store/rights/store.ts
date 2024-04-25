import { create } from "zustand";

/**
 * Basic store for managing "rights" array
 * Must be use with a custom hook
 */
const initialState = {
  isLoading: true,
  isCreator: false,
  isManager: false,
  isReader: false,
  isContributor: false,
  allRolesButRead: false,
};

type State = {
  isLoading: boolean;
  isCreator: boolean;
  isManager: boolean;
  isReader: boolean;
  isContributor: boolean;
  allRolesButRead: boolean;
};

type Action = {
  setIsLoading: () => void;
};

export const useRightsStore = create<State & Action>((set) => ({
  ...initialState,
  setIsLoading: () => set({ isLoading: false }),
}));
