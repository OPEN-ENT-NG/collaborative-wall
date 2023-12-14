import { create } from "zustand";

import { NoteProps } from "~/components/note";
import { initialState, zoomConfig } from "~/config/init-config";

//Trouver une solution pour bien typer State
export type State = any;
export type Action = {
  toggleCanMoveBoard: () => void;
  toggleCanMoveNote: () => void;
  toggleCanZoom: () => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  setCanMoveBoard: (value: boolean) => void;
  setCanMoveNote: (value: boolean) => void;
  setCanZoom: (value: boolean) => void;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  handleMouseMove: (event: React.MouseEvent) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetOffset: () => void;
  resetZoom: () => void;
  updateNotePosition: ({
    activeId,
    x,
    y,
  }: {
    activeId: string;
    x: number;
    y: number;
  }) => void;
  createNote: () => void;
  deleteNote: (id: string | number) => void;
};

export const useWhiteboard = create<State & Action>()(
  (set: (value: State) => void, get: any) => ({
    ...initialState,
    toggleCanMoveBoard: () =>
      set((state: { canMoveBoard: boolean }) => ({
        canMoveBoard: !state.canMoveBoard,
      })),
    toggleCanMoveNote: () =>
      set((state: { canMoveNote: boolean }) => ({
        canMoveNote: !state.canMoveNote,
      })),
    toggleCanZoom: () =>
      set((state: { canZoom: boolean }) => ({ canZoom: !state.canZoom })),
    setCanMoveBoard: (value: boolean) => set({ canMoveBoard: value }),
    setCanMoveNote: (value: boolean) => set({ canMoveNote: value }),
    setCanZoom: (value: boolean) => set({ canZoom: value }),
    handleTouchStart: (event: React.TouchEvent) => {
      if (!get().canMoveBoard) return;

      set(() => ({
        isDragging: true,
        startPosition: {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        },
      }));
    },
    handleTouchMove: (event: React.TouchEvent) => {
      if (!get().isDragging) return;

      const offsetX = event.touches[0].clientX - get().startPosition.x;
      const offsetY = event.touches[0].clientY - get().startPosition.y;

      set((state: { offset: { x: number; y: number } }) => ({
        offset: { x: state.offset.x + offsetX, y: state.offset.y + offsetY },
        startPosition: {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        },
      }));
    },

    handleTouchEnd: () => {
      if (!get().isDragging) return;

      set(() => ({
        isDragging: false,
      }));
    },
    handleMouseDown: (event: React.MouseEvent) => {
      if (!get().canMoveBoard) return;

      set(() => ({
        isDragging: true,
        startPosition: { x: event.clientX, y: event.clientY },
      }));
    },
    handleMouseUp: () => {
      if (!get().canMoveBoard) return;

      set(() => ({
        isDragging: false,
      }));
    },
    handleWheel: (event: React.WheelEvent<HTMLDivElement>) => {
      if (get().canZoom && (event.ctrlKey || event.metaKey)) {
        const zoom = Math.max(
          zoomConfig.MIN_ZOOM,
          Math.min(
            get().zoom + event.deltaY * zoomConfig.FACTOR_ZOOM,
            zoomConfig.MAX_ZOOM,
          ),
        );

        set(() => ({ zoom: parseFloat(zoom.toFixed(2)) }));
      } else {
        const offsetX = event.deltaX * -1.5;
        const offsetY = event.deltaY * -1.5;

        set((state: { offset: { x: number; y: number } }) => ({
          offset: { x: state.offset.x + offsetX, y: state.offset.y + offsetY },
        }));
      }
    },
    handleMouseMove: (event: React.MouseEvent) => {
      if (!get().isDragging) return;

      const offsetX = event.clientX - get().startPosition.x;
      const offsetY = event.clientY - get().startPosition.y;

      set((state: { offset: { x: number; y: number } }) => ({
        offset: { x: state.offset.x + offsetX, y: state.offset.y + offsetY },
        startPosition: { x: event.clientX, y: event.clientY },
      }));
    },
    zoomOut: () => {
      if (!get().canZoom || get().zoom === zoomConfig.MIN_ZOOM) return;

      const zoom =
        get().zoom === zoomConfig.MIN_ZOOM
          ? 0
          : Math.max(zoomConfig.FACTOR_ZOOM, get().zoom - zoomConfig.MIN_ZOOM);
      set(() => ({ zoom: parseFloat(zoom.toFixed(2)) }));
    },
    zoomIn: () => {
      if (!get().canZoom || get().zoom === zoomConfig.MAX_ZOOM) return;

      const zoom = get().zoom + zoomConfig.MIN_ZOOM;
      set(() => ({ zoom: parseFloat(zoom.toFixed(2)) }));
    },
    resetOffset: () => {
      set(() => ({ offset: { x: 0, y: 0 }, zoom: zoomConfig.DEFAULT_ZOOM }));
    },
    resetZoom: () => {
      if (!get().canZoom) return;
      set(() => ({ zoom: zoomConfig.DEFAULT_ZOOM }));
    },
    updateNotePosition: ({
      activeId,
      y,
      x,
    }: {
      activeId: number;
      x: number;
      y: number;
    }) => {
      set((state: { notes: NoteProps[] }) => ({
        notes: state.notes.map((note) => {
          if (note.id === activeId) {
            return {
              ...note,
              offset: { x: note.offset.x + x, y: note.offset.y + y },
              zIndex: 2,
            };
          }
          return {
            ...note,
            zIndex: 1,
          };
        }),
      }));
    },
    createNote: () => {
      const notes = get().notes;
      const notesSize = notes.length;
      const nextId = notesSize + 1;

      const whiteboard = document.querySelector(".whiteboard");
      const whiteboardWidth = whiteboard ? whiteboard.clientWidth : 0;
      const whiteboardHeight = whiteboard ? whiteboard.clientHeight : 0;

      const x = (whiteboardWidth - 224) / 2;
      const y = (whiteboardHeight - 224) / 2;

      const newNote = {
        id: nextId,
        title: `note ${nextId}`,
        text: `lorem ipsum lorem ipsum${nextId}`,
        offset: { x, y },
        zIndex: nextId,
      };

      set((state: { notes: NoteProps[] }) => ({
        notes: [...state.notes, newNote],
      }));
    },
    deleteNote: (id: string | number) => {
      set((state: { notes: NoteProps[] }) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }));
    },
  }),
);
