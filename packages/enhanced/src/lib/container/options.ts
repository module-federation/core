/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
export type ContainerOptionsFormat<T> =
  | (string | Record<string, string | string[] | T>)[]
  | Record<string, string | string[] | T>;

/** @template T @typedef {(string | Record<string, string | string[] | T>)[] | Record<string, string | string[] | T>} ContainerOptionsFormat */

/**
 * @template T
 * @template N
 * @param {ContainerOptionsFormat<T>} options options passed by the user
 * @param {function(string | string[], string) : N} normalizeSimple normalize a simple item
 * @param {function(T, string) : N} normalizeOptions normalize a complex item
 * @param {function(string, N): void} fn processing function
 * @returns {void}
 */
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

/**
 * @template T
 * @template R
 * @param {ContainerOptionsFormat<T>} options options passed by the user
 * @param {function(string | string[], string) : R} normalizeSimple normalize a simple item
 * @param {function(T, string) : R} normalizeOptions normalize a complex item
 * @returns {[string, R][]} parsed options
 */
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

/**
 * @template T
 * @param {string} scope scope name
 * @param {ContainerOptionsFormat<T>} options options passed by the user
 * @returns {Record<string, string | string[] | T>} options to spread or pass
 */
export function scope<T>(
  scope: string,
  options: ContainerOptionsFormat<T>,
): Record<string, string | string[] | T> {
  const obj: Record<string, string | string[] | T> = {};
  process(
    options,
    (item) => item as string | string[] | T,
    (item) => item as string | string[] | T,
    (key, value) => {
      obj[
        key.startsWith('./') ? `${scope}${key.slice(1)}` : `${scope}/${key}`
      ] = value;
    },
  );
  return obj;
}
