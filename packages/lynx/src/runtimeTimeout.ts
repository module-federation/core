export const loadWithTimeout = <T>(
  timeout: number,
  message: string,
  start: (
    resolve: (value: T) => void,
    reject: (error: unknown) => void,
    isSettled: () => boolean,
  ) => void,
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      reject(new Error(message));
    }, timeout);

    const finish = (callback: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      callback();
    };

    try {
      start(
        (value) => finish(() => resolve(value)),
        (error) => finish(() => reject(error)),
        () => settled,
      );
    } catch (error) {
      finish(() => reject(error));
    }
  });
