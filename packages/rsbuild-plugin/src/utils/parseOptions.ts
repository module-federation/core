export type ContainerOptionsFormat<T> =
  | (string | Record<string, string | string[] | T>)[]
  | Record<string, string | string[] | T>;

const process = <T, N>(
  options: ContainerOptionsFormat<T>,
  normalizeSimple: (item: string | string[], name: string) => N,
  normalizeOptions: (item: T, name: string) => N,
  fn: (name: string, item: N) => void,
): void => {
  const array = (
    items: (string | Record<string, string | string[] | T>)[],
  ): void => {
    for (const item of items) {
      if (typeof item === 'string') {
        fn(item, normalizeSimple(item, item));
      } else if (item && typeof item === 'object') {
        object(item as Record<string, string | string[] | T>);
      } else {
        throw new Error('Unexpected options format');
      }
    }
  };
  const object = (obj: Record<string, string | string[] | T>): void => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' || Array.isArray(value)) {
        fn(key, normalizeSimple(value, key));
      } else {
        fn(key, normalizeOptions(value as T, key));
      }
    }
  };
  if (!options) {
    return;
  } else if (Array.isArray(options)) {
    array(options);
  } else if (typeof options === 'object') {
    object(options);
  } else {
    throw new Error('Unexpected options format');
  }
};

export function parseOptions<T, R>(
  options: ContainerOptionsFormat<T>,
  normalizeSimple: (item: string | string[], name: string) => R,
  normalizeOptions: (item: T, name: string) => R,
): [string, R][] {
  const items: [string, R][] = [];
  process(options, normalizeSimple, normalizeOptions, (key, value) => {
    items.push([key, value]);
  });
  return items;
}
