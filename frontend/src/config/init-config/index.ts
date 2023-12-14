/* ZOOM CONFIG */
const MAX_ZOOM = 2;
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.25;
const FACTOR_ZOOM = 0.01;

export const zoomConfig = {
  MAX_ZOOM,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  FACTOR_ZOOM,
} as const;

/* OFFSET CONFIG SHARED BETWEEN NOTE AND WHITEBOARD */
const OFFSET = { x: 0, y: 0 };

export const initialState = {
  canMoveBoard: false,
  canMoveNote: false,
  canZoom: true,
  isDragging: false,
  startPosition: OFFSET,
  offset: OFFSET,
  zoom: zoomConfig.DEFAULT_ZOOM,
  notes: [
    {
      id: 1,
      title: "note 1",
      text: "lorem ipsum",
      offset: OFFSET,
      zIndex: 1,
    },
  ],
};
