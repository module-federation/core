export function arrayToSetDeprecation(set: any, name: string): void;
export function createArrayToSetDeprecationSet(name: any): {
  new (items: any): {
    add(value: any): any;
    clear(): void;
    delete(value: any): boolean;
    forEach(
      callbackfn: (value: any, value2: any, set: Set<any>) => void,
      thisArg?: any,
    ): void;
    has(value: any): boolean;
    readonly size: number;
    entries(): IterableIterator<[any, any]>;
    keys(): IterableIterator<any>;
    values(): IterableIterator<any>;
    [Symbol.iterator](): IterableIterator<any>;
    readonly [Symbol.toStringTag]: string;
  };
  readonly [Symbol.species]: SetConstructor;
};
export function soonFrozenObjectDeprecation<T>(
  obj: any,
  name: string,
  code: string,
  note?: string,
): any;
export function createFakeHook<T>(
  fakeHook: T,
  message?: string | undefined,
  code?: string | undefined,
): FakeHook<T>;
export type FakeHookMarker = {
  /**
   * it's a fake hook
   */
  _fakeHook: true;
};
/**
 * <T>
 */
export type FakeHook<T> = T & FakeHookMarker;
/**
 * @template T
 * @param {T} obj object
 * @param {string} message deprecation message
 * @param {string} code deprecation code
 * @returns {T} object with property access deprecated
 */
export function deprecateAllProperties<T>(
  obj: T,
  message: string,
  code: string,
): T;
