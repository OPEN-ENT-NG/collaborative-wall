export type State = {
  isMobile: boolean;
  canMoveBoard: boolean;
  canMoveNote: boolean;
  isDragging: boolean;
  isOpenDropdown: boolean;
  openShareModal: boolean;
  openUpdateModal: boolean;
  openCreateModal: boolean;
  openDescriptionModal: boolean;
  openBackgroundModal: boolean;
  numberOfNotes: number;
};

export type Action = {
  toggleCanMoveBoard: () => void;
  toggleCanMoveNote: () => void;
  setCanMoveBoard: (value: boolean) => void;
  setCanMoveNote: (value: boolean) => void;
  setNumberOfNotes: (value: number) => void;
  setIsMobile: (query: string | null) => void;
  setOpenShareModal: (value: boolean) => void;
  setOpenUpdateModal: (value: boolean) => void;
  setOpenCreateModal: (value: boolean) => void;
  setOpenDescriptionModal: (value: boolean) => void;
  setIsOpenBackgroundModal: (value: boolean) => void;
  setIsOpenDropdown: (value: boolean) => void;
};
