/**
 * Defines the item type used by this module.
 */
export type Item<T> = Record<string, string | string[] | T>;
/**
 * Defines the container options format type used by this module.
 */
export type ContainerOptionsFormat<T> = (string | Item<T>)[] | Item<T>;
/**
 * Returns parsed options.
 * @template T
 * @template R
 * @param {ContainerOptionsFormat<T>} options options passed by the user
 * @param {(item: string | string[], itemOrKey: string) => R} normalizeSimple normalize a simple item
 * @param {(value: T, key: string) => R} normalizeOptions normalize a complex item
 * @returns {[string, R][]} parsed options
 */
export function parseOptions<T, R>(options: ContainerOptionsFormat<T>, normalizeSimple: (item: string | string[], itemOrKey: string) => R, normalizeOptions: (value: T, key: string) => R): [string, R][];
/**
 * Returns options to spread or pass.
 * @template T
 * @param {string} scope scope name
 * @param {ContainerOptionsFormat<T>} options options passed by the user
 * @returns {Record<string, string | string[] | T>} options to spread or pass
 */
export function scope<T>(scope: string, options: ContainerOptionsFormat<T>): Record<string, string | string[] | T>;
