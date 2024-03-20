export function normalizeOptions<T>(
  enableDefault: boolean,
  defaultOptions: T,
  key: string,
) {
  return function <U extends boolean | undefined | T>(options: U): T | false {
    if (options === false) {
      return false;
    }

    if (typeof options === 'undefined') {
      if (enableDefault) {
        return defaultOptions;
      } else {
        return false;
      }
    }

    if (options === true) {
      return defaultOptions;
    }

    if (options && typeof options === 'object') {
      return {
        ...(defaultOptions as T),
        ...options,
      };
    }

    throw new Error(
      `Unexpected type for \`${key}\`, expect boolean/undefined/object, got: ${typeof options}`,
    );
  };
}
