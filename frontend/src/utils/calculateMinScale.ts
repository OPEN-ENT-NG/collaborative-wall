import { wallConfig } from "~/config";

export const calculateMinScale = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const scaleX = screenWidth / wallConfig.WIDTH_WALL;
  const scaleY = screenHeight / wallConfig.HEIGHT_WALL;

  const minScale = Math.max(scaleX, scaleY, 0.5);

  return minScale;
};
