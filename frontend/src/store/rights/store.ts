// import { create } from "zustand";

// /**
//  * Basic store for managing "rights" array
//  * Must be use with a custom hook
//  */
// const initialState = {
//   creator: false,
//   manager: false,
//   read: false,
//   contrib: false,
// };

// type State = {
//   creator: boolean;
//   manager: boolean;
//   read: boolean;
//   contrib: boolean;
// };

// export const useRightsStore = create<State>(() => ({
//   ...initialState,
// }));

import { create } from "zustand";

type RightRole = "contrib" | "creator" | "manager" | "read";
type UserRights = Record<RightRole, boolean>;

interface UserRightsState {
  userRights: UserRights;
  setUserRights: (rights: UserRights) => void;
}

/**
 * Basic store for managing "rights" array
 * Must be use with a custom hook
 */
export const useUserRightsStore = create<UserRightsState>((set) => ({
  userRights: {
    creator: false,
    contrib: false,
    manager: false,
    read: false,
  },
  setUserRights: (rights: UserRights) => set({ userRights: rights }),
}));
