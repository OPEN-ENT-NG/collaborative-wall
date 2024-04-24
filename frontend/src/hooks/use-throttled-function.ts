import { useCallback, useEffect, useRef } from "react";

type useThrottledFunctionProps<T> = {
  callbackFn: (args: T) => any;
  throttleMs?: number;
};

export const DEFAULT_THROTTLE_MS = 100;

const getRemainingTime = (lastTriggeredTime: number, throttleMs: number) => {
  const elapsedTime = Date.now() - lastTriggeredTime;
  const remainingTime = throttleMs - elapsedTime;

  return remainingTime < 0 ? 0 : remainingTime;
};

export const useThrottledFunction = <T>({
  callbackFn,
  throttleMs = DEFAULT_THROTTLE_MS,
}: useThrottledFunctionProps<T>) => {
  const lastTriggered = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const throttledFn = useCallback(
    (args: T) => {
      let remainingTime = getRemainingTime(lastTriggered.current, throttleMs);

      if (remainingTime === 0) {
        lastTriggered.current = Date.now();
        callbackFn(args);
        cancel();
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          remainingTime = getRemainingTime(lastTriggered.current, throttleMs);

          if (remainingTime === 0) {
            lastTriggered.current = Date.now();
            callbackFn(args);
            cancel();
          }
        }, remainingTime);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callbackFn, cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { cancel, throttledFn };
};
