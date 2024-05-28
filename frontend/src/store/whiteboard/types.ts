export type State = {
  isMobile: boolean;
  canMoveBoard: boolean;
  canMoveNote: boolean;
  isDragging: boolean;
  dropdownState: {
    isOpen: boolean;
    idDropdown: string;
  };
  openShareModal: boolean;
  openUpdateModal: boolean;
  openCreateModal: boolean;
  openDescriptionModal: boolean;
  openBackgroundModal: boolean;
  numberOfNotes: number;
  positionViewport: {
    x: number;
    y: number;
  };
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
  setDropdownState: (value: { isOpen: boolean; idDropdown: string }) => void;
  setPositionViewport: (value: { x: number; y: number }) => void;
};
