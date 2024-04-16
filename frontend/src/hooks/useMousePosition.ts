import { useState, useEffect, useCallback } from "react";

import { useThrottledFunction } from "./useThrottledFunction";
import { useWebsocketStore } from "~/store";
import { Mode } from "~/store/websocket/types";

/* const getRandomPosition = () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
}); */

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const { mode, sendNoteCursorMovedEvent } = useWebsocketStore();

  const callbackFnToThrottle = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      sendNoteCursorMovedEvent([{ x, y }]);
    },
    [sendNoteCursorMovedEvent],
  );

  const { throttledFn: throttledPosition } = useThrottledFunction<{
    x: number;
    y: number;
  }>({
    callbackFn: callbackFnToThrottle,
    throttleMs: 100,
  });

  useEffect(() => {
    if (mode === Mode.HTTP) return;

    const updateMousePosition = (event: {
      clientX: number;
      clientY: number;
    }) => {
      const x = event.clientX;
      const y = event.clientY;

      throttledPosition({ x, y });
      setMousePosition({ x, y });
    };

    /* const moveMouseRandomly = () => {
      throttledPosition(getRandomPosition());
      setMousePosition(getRandomPosition());
    }; */

    // const intervalId = setInterval(moveMouseRandomly, 2000);

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      // clearInterval(intervalId);
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [mode, throttledPosition]);

  return mousePosition;
};

export default useMousePosition;
