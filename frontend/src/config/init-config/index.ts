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
export const OFFSET = { x: 0, y: 0 };

const HEIGHT_WALL = 1800;
const WIDTH_WALL = 2880;

export const wallConfig = {
  HEIGHT_WALL,
  WIDTH_WALL,
} as const;

interface Colors {
  [key: string]: {
    border: string;
    background: string;
  };
}

/* COLORS CONFIG */
export const noteColors: Colors = {
  white: {
    border: "#C7C7C7",
    background: "#FFFFFF",
  },
  yellow: {
    border: "#ECBE30",
    background: "#FCF7DE",
  },
  orange: {
    border: "#FF8D2E",
    background: "#FFEFE3",
  },
  red: {
    border: "#E13A3A",
    background: "#FFECEE",
  },
  purple: {
    border: "#823AA1",
    background: "#F6ECF9",
  },
  blue: {
    border: "#2A9CC8",
    background: "#E5F5FF",
  },
  green: {
    border: "#46BFAF",
    background: "#E6F9F8",
  },
};

export const backgroundImages = [
  "/img/cloud.png",
  "/img/default.jpg",
  "/img/paper.jpg",
  "/img/wood.jpg",
];

export const backgroundColors = [
  "115deg, #E5F5FF 0.32%, #46AFE6 100%",
  "116.76deg, #FFECEE 0.32%, #FF3A55 99.93%",
  "116.76deg, #F6ECF9 0.32%, #A348C0 99.93%",
  "116.76deg, #FFEFE3 0.32%, #FF8D2E 99.93%",
  "116.76deg, #EAF7E4 0.32%, #5AC235 99.93%",
  "116.76deg, #FBF4D5 0.32%, #F1CA00 99.93%",
];
