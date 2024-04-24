import { useCallback, useEffect, useState } from "react";

import { useWebsocketStore } from "~/features/websocket/hooks/use-websocket-store";
import { Mode } from "~/store/websocket/types";
import {
  DEFAULT_THROTTLE_MS,
  useThrottledFunction,
} from "./use-throttled-function";

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
    throttleMs: DEFAULT_THROTTLE_MS,
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

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      // clearInterval(intervalId);
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [mode, throttledPosition]);

  return mousePosition;
};

export default useMousePosition;