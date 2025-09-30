export type Prefix<T extends any[]> = T extends [infer First, ...infer Rest] ? [] | [First] | [First, ...Prefix<Rest>] : [];
export type TupleMap<Keypath extends Array<any>, V> = {
    set(keys: Prefix<Keypath>, value: V): void;
    get(keys: Prefix<Keypath>): V | null;
    delete(keys: Prefix<Keypath>): void;
};
/**
 * Creates a map whose keys are tuples. Tuples are compared per-element. This
 * is useful when a key has multiple parts, but you don't want to concatenate
 * them into a single string value.
 *
 * In the Segment Cache, we use this to store cache entries by both their href
 * and their Next-URL.
 *
 * Example:
 *   map.set(['https://localhost', 'foo/bar/baz'], 'yay');
 *   map.get(['https://localhost', 'foo/bar/baz']); // returns 'yay'
 */
export declare function createTupleMap<Keypath extends Array<any>, V>(): TupleMap<Keypath, V>;
