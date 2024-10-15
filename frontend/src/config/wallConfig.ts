import { CoordinateExtent } from 'reactflow';

const DURATION = 1000;
const HEIGHT_WALL = 1800;
const WIDTH_WALL = 2880;

export const transitionDuration = {
  duration: DURATION,
};

export const resetViewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const wallConfig = {
  HEIGHT_WALL,
  WIDTH_WALL,
} as const;

export const translateExtent: CoordinateExtent = [
  [-0, -0],
  [wallConfig.WIDTH_WALL, wallConfig.HEIGHT_WALL],
];

export const nodeExtent: CoordinateExtent = [
  [0, 0],
  [wallConfig.WIDTH_WALL, wallConfig.HEIGHT_WALL],
];

interface Colors {
  [key: string]: {
    border: string;
    background: string;
  };
}

/* COLORS CONFIG */
export const noteColors: Colors = {
  white: {
    border: '#C7C7C7',
    background: '#FFFFFF',
  },
  yellow: {
    border: '#F1CA00',
    background: '#FBF4D5',
  },
  orange: {
    border: '#FF8D2E',
    background: '#FFEFE3',
  },
  red: {
    border: '#FF3A55',
    background: '#FFECEE',
  },
  purple: {
    border: '#A348C0',
    background: '#F6ECF9',
  },
  blue: {
    border: '#46AFE6',
    background: '#E5F5FF',
  },
  green: {
    border: '#5AC235',
    background: '#EAF7E4',
  },
};

export const backgroundImages = [
  'img/green-hill.png',
  'img/blue-topo.png',
  'img/orange-hill.png',
];

export const backgroundColors = [
  '115deg, #E5F5FF 0.32%, #46AFE6 100%',
  '116.76deg, #FFECEE 0.32%, #FF3A55 99.93%',
  '116.76deg, #F6ECF9 0.32%, #A348C0 99.93%',
  '116.76deg, #FFEFE3 0.32%, #FF8D2E 99.93%',
  '116.76deg, #EAF7E4 0.32%, #5AC235 99.93%',
  '116.76deg, #FBF4D5 0.32%, #F1CA00 99.93%',
];
