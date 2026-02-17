export type Compilation = import("../Compilation");
export type EntryOptions = import("../Entrypoint").EntryOptions;
export type RuntimeSpec = string | SortableSet<string> | undefined;
export type RuntimeCondition = RuntimeSpec | boolean;
export type RuntimeSpecMapInnerMap<T> = Map<string, T>;
/**
 * @template T
 * @typedef {Map<string, T>} RuntimeSpecMapInnerMap
 */
/**
 * @template T
 * @template [R=T]
 */
export class RuntimeSpecMap<T, R = T> {
    /**
     * @param {RuntimeSpecMap<T, R>=} clone copy form this
     */
    constructor(clone?: RuntimeSpecMap<T, R> | undefined);
    /** @type {0 | 1 | 2} */
    _mode: 0 | 1 | 2;
    /** @type {RuntimeSpec} */
    _singleRuntime: RuntimeSpec;
    /** @type {R | undefined} */
    _singleValue: R | undefined;
    /** @type {RuntimeSpecMapInnerMap<R> | undefined} */
    _map: RuntimeSpecMapInnerMap<R> | undefined;
    /**
     * @param {RuntimeSpec} runtime the runtimes
     * @returns {R | undefined} value
     */
    get(runtime: RuntimeSpec): R | undefined;
    /**
     * @param {RuntimeSpec} runtime the runtimes
     * @returns {boolean} true, when the runtime is stored
     */
    has(runtime: RuntimeSpec): boolean;
    /**
     * @param {RuntimeSpec} runtime the runtimes
     * @param {R} value the value
     */
    set(runtime: RuntimeSpec, value: R): void;
    /**
     * @param {RuntimeSpec} runtime the runtimes
     * @param {() => R} computer function to compute the value
     * @returns {R} the new value
     */
    provide(runtime: RuntimeSpec, computer: () => R): R;
    /**
     * @param {RuntimeSpec} runtime the runtimes
     */
    delete(runtime: RuntimeSpec): void;
    /**
     * @param {RuntimeSpec} runtime the runtimes
     * @param {(value: R | undefined) => R} fn function to update the value
     */
    update(runtime: RuntimeSpec, fn: (value: R | undefined) => R): void;
    keys(): RuntimeSpec[];
    /**
     * @returns {IterableIterator<R>} values
     */
    values(): IterableIterator<R>;
    get size(): number;
}
export class RuntimeSpecSet {
    /**
     * @param {Iterable<RuntimeSpec>=} iterable iterable
     */
    constructor(iterable?: Iterable<RuntimeSpec> | undefined);
    /** @type {Map<string, RuntimeSpec>} */
    _map: Map<string, RuntimeSpec>;
    /**
     * @param {RuntimeSpec} runtime runtime
     */
    add(runtime: RuntimeSpec): void;
    /**
     * @param {RuntimeSpec} runtime runtime
     * @returns {boolean} true, when the runtime exists
     */
    has(runtime: RuntimeSpec): boolean;
    get size(): number;
    /**
     * @returns {IterableIterator<RuntimeSpec>} iterable iterator
     */
    [Symbol.iterator](): IterableIterator<RuntimeSpec>;
}
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {-1 | 0 | 1} compare
 */
export function compareRuntime(a: RuntimeSpec, b: RuntimeSpec): -1 | 0 | 1;
/**
 * @param {RuntimeSpec} runtime runtime
 * @param {(runtime?: RuntimeSpec) => boolean} filter filter function
 * @returns {boolean | RuntimeSpec} true/false if filter is constant for all runtimes, otherwise runtimes that are active
 */
export function filterRuntime(runtime: RuntimeSpec, filter: (runtime?: RuntimeSpec) => boolean): boolean | RuntimeSpec;
/**
 * @param {RuntimeSpec} runtime runtime
 * @param {(runtime: string | undefined) => void} fn functor
 * @param {boolean} deterministicOrder enforce a deterministic order
 * @returns {void}
 */
export function forEachRuntime(runtime: RuntimeSpec, fn: (runtime: string | undefined) => void, deterministicOrder?: boolean): void;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Entrypoint").EntryOptions} EntryOptions */
/** @typedef {string | SortableSet<string> | undefined} RuntimeSpec */
/** @typedef {RuntimeSpec | boolean} RuntimeCondition */
/**
 * @param {Compilation} compilation the compilation
 * @param {string} name name of the entry
 * @param {EntryOptions=} options optionally already received entry options
 * @returns {RuntimeSpec} runtime
 */
export function getEntryRuntime(compilation: Compilation, name: string, options?: EntryOptions | undefined): RuntimeSpec;
/**
 * @param {RuntimeSpec} runtime runtime(s)
 * @returns {string} key of runtimes
 */
export function getRuntimeKey(runtime: RuntimeSpec): string;
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} merged
 */
export function intersectRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * @param {string} key key of runtimes
 * @returns {RuntimeSpec} runtime(s)
 */
export function keyToRuntime(key: string): RuntimeSpec;
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} merged
 */
export function mergeRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * @param {RuntimeCondition} a first
 * @param {RuntimeCondition} b second
 * @param {RuntimeSpec} runtime full runtime
 * @returns {RuntimeCondition} result
 */
export function mergeRuntimeCondition(a: RuntimeCondition, b: RuntimeCondition, runtime: RuntimeSpec): RuntimeCondition;
/**
 * @param {RuntimeSpec | true} a first
 * @param {RuntimeSpec | true} b second
 * @param {RuntimeSpec} runtime full runtime
 * @returns {RuntimeSpec | true} result
 */
export function mergeRuntimeConditionNonFalse(a: RuntimeSpec | true, b: RuntimeSpec | true, runtime: RuntimeSpec): RuntimeSpec | true;
/**
 * @param {RuntimeSpec} a first (may be modified)
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} merged
 */
export function mergeRuntimeOwned(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * @param {RuntimeCondition} runtimeCondition runtime condition
 * @returns {string} readable version
 */
export function runtimeConditionToString(runtimeCondition: RuntimeCondition): string;
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {boolean} true, when they are equal
 */
export function runtimeEqual(a: RuntimeSpec, b: RuntimeSpec): boolean;
/**
 * @param {RuntimeSpec} runtime runtime(s)
 * @returns {string} readable version
 */
export function runtimeToString(runtime: RuntimeSpec): string;
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} result
 */
export function subtractRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * @param {RuntimeCondition} a first
 * @param {RuntimeCondition} b second
 * @param {RuntimeSpec} runtime runtime
 * @returns {RuntimeCondition} result
 */
export function subtractRuntimeCondition(a: RuntimeCondition, b: RuntimeCondition, runtime: RuntimeSpec): RuntimeCondition;
import SortableSet = require("./SortableSet");
