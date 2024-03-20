export function createDeferred<T>(): Defer<T> {
  let resolve: (data: T) => void, reject: (e?: string | Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

export type Defer<T> = {
  resolve: (data: T) => void;
  reject: (e?: string | Error) => void;
  promise: Promise<T>;
};
