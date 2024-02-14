/* ZOOM CONFIG */
const MAX_ZOOM = 2;
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.5;
const SCALE_ZOOM = 0.25;

export const zoomConfig = {
  MAX_ZOOM,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  SCALE_ZOOM,
} as const;

/* INITIALSTATE CONFIG */
const OFFSET = { x: 0, y: 0 };

const HEIGHT_WALL = 1800;
const WIDTH_WALL = 2880;

export const wallConfig = {
  HEIGHT_WALL,
  WIDTH_WALL,
} as const;

export const initialState = {
  canMoveBoard: false,
  canMoveNote: false,
  canZoom: true,
  isDragging: false,
  startPosition: OFFSET,
  offset: OFFSET,
  zoom: zoomConfig.DEFAULT_ZOOM,
};

interface Colors {
  [key: string]: string[];
}

/* COLORS CONFIG */
export const colorsNotes: Colors = {
  "#FFFFFF": ["#FFFFFF", "#C7C7C7"],
  "#FCF7DE": ["#FCF7DE", "#ECBE30"],
  "#FFEFE3": ["#FFEFE3", "#FF8D2E"],
  "#FFECEE": ["#FFECEE", "#E13A3A"],
  "#F6ECF9": ["#F6ECF9", "#823AA1"],
  "#E5F5FF": ["#E5F5FF", "#2A9CC8"],
  "#E6F9F8": ["#E6F9F8", "#46BFAF"],
};
