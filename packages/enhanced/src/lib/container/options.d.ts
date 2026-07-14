export type ContainerOptionsFormat<T> =
  | (string | Record<string, string | string[] | T>)[]
  | Record<string, string | string[] | T>;
/**
 * @template T
 * @template R
 * @param {ContainerOptionsFormat<T>} options options passed by the user
 * @param {function(string | string[], string) : R} normalizeSimple normalize a simple item
 * @param {function(T, string) : R} normalizeOptions normalize a complex item
 * @returns {[string, R][]} parsed options
 */
export declare function parseOptions<T, R>(
  options: ContainerOptionsFormat<T>,
  normalizeSimple: (item: string | string[], name: string) => R,
  normalizeOptions: (item: T, name: string) => R,
): [string, R][];
/**
 * @template T
 * @param {string} scope scope name
 * @param {ContainerOptionsFormat<T>} options options passed by the user
 * @returns {Record<string, string | string[] | T>} options to spread or pass
 */
export declare function scope<T>(
  scope: string,
  options: ContainerOptionsFormat<T>,
): Record<string, string | string[] | T>;
