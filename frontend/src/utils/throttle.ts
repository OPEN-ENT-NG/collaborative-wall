export function throttle<T>(func: (arg: T) => void, limit: number) {
  let inThrottle = false;
  return function (arg: T) {
    if (!inThrottle) {
      func(arg);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
