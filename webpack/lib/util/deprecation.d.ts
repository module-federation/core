export function arrayToSetDeprecation<T>(set: Set<T>, name: string): void;
export function createArrayToSetDeprecationSet<T>(name: string): {
    new <T_1 = EXPECTED_ANY>(values?: ReadonlyArray<T_1> | null): {
        add(value: any): /*elided*/ any;
        clear(): void;
        delete(value: any): boolean;
        forEach(callbackfn: (value: any, value2: any, set: Set<any>) => void, thisArg?: any): void;
        has(value: any): boolean;
        readonly size: number;
        entries(): SetIterator<[any, any]>;
        keys(): SetIterator<any>;
        values(): SetIterator<any>;
        [Symbol.iterator](): SetIterator<any>;
        readonly [Symbol.toStringTag]: string;
    };
};
export function createFakeHook<T extends unknown>(fakeHook: T, message?: string | undefined, code?: string | undefined): FakeHook<T>;
export function soonFrozenObjectDeprecation<T extends unknown>(obj: T, name: string, code: string, note?: string): T;
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
export type COPY_METHODS_NAMES = "concat" | "entry" | "filter" | "find" | "findIndex" | "includes" | "indexOf" | "join" | "lastIndexOf" | "map" | "reduce" | "reduceRight" | "slice" | "some";
export type DISABLED_METHODS_NAMES = "copyWithin" | "entries" | "fill" | "keys" | "pop" | "reverse" | "shift" | "splice" | "sort" | "unshift";
export type SetWithDeprecatedArrayMethods<T> = Set<T> & {
    [Symbol.isConcatSpreadable]: boolean;
} & {
    push: (...items: T[]) => void;
    length?: number;
} & { [P in DISABLED_METHODS_NAMES]: () => void; } & { [P in COPY_METHODS_NAMES]: P extends keyof Array<T> ? () => Pick<Array<T>, P> : never; };
/**
 * @template T
 * @param {T} obj object
 * @param {string} message deprecation message
 * @param {string} code deprecation code
 * @returns {T} object with property access deprecated
 */
export function deprecateAllProperties<T>(obj: T, message: string, code: string): T;
