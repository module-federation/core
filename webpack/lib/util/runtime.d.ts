export type RuntimeSpecSortableSet = SortableSet<string>;
export type RuntimeSpec = string | RuntimeSpecSortableSet | undefined;
export type RuntimeCondition = RuntimeSpec | boolean;
/**
 * Defines the runtime spec map inner map type used by this module.
 */
export type RuntimeSpecMapInnerMap<T> = Map<string, T>;
/**
 * Defines the runtime spec map inner map type used by this module.
 * @template T
 * @typedef {Map<string, T>} RuntimeSpecMapInnerMap
 */
/**
 * Represents RuntimeSpecMap.
 * @template T
 * @template [R=T]
 */
export class RuntimeSpecMap<T, R = T> {
    /**
     * Creates an instance of RuntimeSpecMap.
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
     * Returns value.
     * @param {RuntimeSpec} runtime the runtimes
     * @returns {R | undefined} value
     */
    get(runtime: RuntimeSpec): R | undefined;
    /**
     * Returns true, when the runtime is stored.
     * @param {RuntimeSpec} runtime the runtimes
     * @returns {boolean} true, when the runtime is stored
     */
    has(runtime: RuntimeSpec): boolean;
    /**
     * Updates default using the provided runtime.
     * @param {RuntimeSpec} runtime the runtimes
     * @param {R} value the value
     */
    set(runtime: RuntimeSpec, value: R): void;
    /**
     * Returns the new value.
     * @param {RuntimeSpec} runtime the runtimes
     * @param {() => R} computer function to compute the value
     * @returns {R} the new value
     */
    provide(runtime: RuntimeSpec, computer: () => R): R;
    /**
     * Processes the provided runtime.
     * @param {RuntimeSpec} runtime the runtimes
     */
    delete(runtime: RuntimeSpec): void;
    /**
     * Processes the provided runtime.
     * @param {RuntimeSpec} runtime the runtimes
     * @param {(value: R | undefined) => R} fn function to update the value
     */
    update(runtime: RuntimeSpec, fn: (value: R | undefined) => R): void;
    keys(): RuntimeSpec[];
    /**
     * Returns values.
     * @returns {IterableIterator<R>} values
     */
    values(): IterableIterator<R>;
    get size(): number;
}
export class RuntimeSpecSet {
    /**
     * Creates an instance of RuntimeSpecSet.
     * @param {Iterable<RuntimeSpec>=} iterable iterable
     */
    constructor(iterable?: Iterable<RuntimeSpec> | undefined);
    /** @type {Map<string, RuntimeSpec>} */
    _map: Map<string, RuntimeSpec>;
    /**
     * Processes the provided runtime.
     * @param {RuntimeSpec} runtime runtime
     */
    add(runtime: RuntimeSpec): void;
    /**
     * Returns true, when the runtime exists.
     * @param {RuntimeSpec} runtime runtime
     * @returns {boolean} true, when the runtime exists
     */
    has(runtime: RuntimeSpec): boolean;
    get size(): number;
    /**
     * Returns iterable iterator.
     * @returns {IterableIterator<RuntimeSpec>} iterable iterator
     */
    [Symbol.iterator](): IterableIterator<RuntimeSpec>;
}
/**
 * Compares the provided values and returns their ordering.
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {-1 | 0 | 1} compare
 */
export function compareRuntime(a: RuntimeSpec, b: RuntimeSpec): -1 | 0 | 1;
/**
 * Returns true/false if filter is constant for all runtimes, otherwise runtimes that are active.
 * @param {RuntimeSpec} runtime runtime
 * @param {(runtime?: RuntimeSpec) => boolean} filter filter function
 * @returns {boolean | RuntimeSpec} true/false if filter is constant for all runtimes, otherwise runtimes that are active
 */
export function filterRuntime(runtime: RuntimeSpec, filter: (runtime?: RuntimeSpec) => boolean): boolean | RuntimeSpec;
/**
 * Processes the provided runtime.
 * @param {RuntimeSpec} runtime runtime
 * @param {(runtime: string | undefined) => void} fn functor
 * @param {boolean} deterministicOrder enforce a deterministic order
 * @returns {void}
 */
export function forEachRuntime(runtime: RuntimeSpec, fn: (runtime: string | undefined) => void, deterministicOrder?: boolean): void;
/** @import Compilation from "../Compilation" */
/** @import { EntryOptions } from "../graph/Entrypoint" */
/** @typedef {SortableSet<string>} RuntimeSpecSortableSet */
/** @typedef {string | RuntimeSpecSortableSet | undefined} RuntimeSpec */
/** @typedef {RuntimeSpec | boolean} RuntimeCondition */
/**
 * Gets entry runtime.
 * @param {Compilation} compilation the compilation
 * @param {string} name name of the entry
 * @param {EntryOptions=} options optionally already received entry options
 * @returns {RuntimeSpec} runtime
 */
export function getEntryRuntime(compilation: Compilation, name: string, options?: EntryOptions | undefined): RuntimeSpec;
/**
 * Returns key of runtimes.
 * @param {RuntimeSpec} runtime runtime(s)
 * @returns {string} key of runtimes
 */
export function getRuntimeKey(runtime: RuntimeSpec): string;
/**
 * Returns merged.
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} merged
 */
export function intersectRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * Returns runtime(s).
 * @param {string} key key of runtimes
 * @returns {RuntimeSpec} runtime(s)
 */
export function keyToRuntime(key: string): RuntimeSpec;
/**
 * Merges the provided values into a single result.
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} merged
 */
export function mergeRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * Merges runtime condition.
 * @param {RuntimeCondition} a first
 * @param {RuntimeCondition} b second
 * @param {RuntimeSpec} runtime full runtime
 * @returns {RuntimeCondition} result
 */
export function mergeRuntimeCondition(a: RuntimeCondition, b: RuntimeCondition, runtime: RuntimeSpec): RuntimeCondition;
/**
 * Merges runtime condition non false.
 * @param {RuntimeSpec | true} a first
 * @param {RuntimeSpec | true} b second
 * @param {RuntimeSpec} runtime full runtime
 * @returns {RuntimeSpec | true} result
 */
export function mergeRuntimeConditionNonFalse(a: RuntimeSpec | true, b: RuntimeSpec | true, runtime: RuntimeSpec): RuntimeSpec | true;
/**
 * Merges runtime owned.
 * @param {RuntimeSpec} a first (may be modified)
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} merged
 */
export function mergeRuntimeOwned(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * Runtime condition to string.
 * @param {RuntimeCondition} runtimeCondition runtime condition
 * @returns {string} readable version
 */
export function runtimeConditionToString(runtimeCondition: RuntimeCondition): string;
/**
 * Returns true, when they are equal.
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {boolean} true, when they are equal
 */
export function runtimeEqual(a: RuntimeSpec, b: RuntimeSpec): boolean;
/**
 * Returns readable version.
 * @param {RuntimeSpec} runtime runtime(s)
 * @returns {string} readable version
 */
export function runtimeToString(runtime: RuntimeSpec): string;
/**
 * Returns result.
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} result
 */
export function subtractRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * Subtract runtime condition.
 * @param {RuntimeCondition} a first
 * @param {RuntimeCondition} b second
 * @param {RuntimeSpec} runtime runtime
 * @returns {RuntimeCondition} result
 */
export function subtractRuntimeCondition(a: RuntimeCondition, b: RuntimeCondition, runtime: RuntimeSpec): RuntimeCondition;
import SortableSet = require("./SortableSet");
import type Compilation from "../Compilation";
import type { EntryOptions } from "../graph/Entrypoint";
