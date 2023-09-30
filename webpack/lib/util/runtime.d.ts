export function getEntryRuntime(
  compilation: Compilation,
  name: string,
  options?: EntryOptions | undefined,
): RuntimeSpec;
export function forEachRuntime(
  runtime: RuntimeSpec,
  fn: (arg0: string | undefined) => void,
  deterministicOrder?: boolean,
): void;
export function runtimeConditionToString(
  runtimeCondition: RuntimeCondition,
): string;
export function compareRuntime(a: RuntimeSpec, b: RuntimeSpec): -1 | 0 | 1;
export function mergeRuntimeCondition(
  a: RuntimeCondition,
  b: RuntimeCondition,
  runtime: RuntimeSpec,
): RuntimeCondition;
export function mergeRuntimeConditionNonFalse(
  a: RuntimeSpec | true,
  b: RuntimeSpec | true,
  runtime: RuntimeSpec,
): RuntimeSpec | true;
export function intersectRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
export function subtractRuntimeCondition(
  a: RuntimeCondition,
  b: RuntimeCondition,
  runtime: RuntimeSpec,
): RuntimeCondition;
export function filterRuntime(
  runtime: RuntimeSpec,
  filter: (arg0: RuntimeSpec) => boolean,
): boolean | RuntimeSpec;
export type Compilation = import('../Compilation');
export type EntryOptions = import('../Entrypoint').EntryOptions;
export type RuntimeSpec = string | SortableSet<string> | undefined;
export type RuntimeCondition = RuntimeSpec | boolean;
export type RuntimeSpecMapInnerMap<T> = Map<string, T>;
/**
 * @param {RuntimeSpec} runtime runtime(s)
 * @returns {string} key of runtimes
 */
export function getRuntimeKey(runtime: RuntimeSpec): string;
/**
 * @param {string} key key of runtimes
 * @returns {RuntimeSpec} runtime(s)
 */
export function keyToRuntime(key: string): RuntimeSpec;
/**
 * @param {RuntimeSpec} runtime runtime(s)
 * @returns {string} readable version
 */
export function runtimeToString(runtime: RuntimeSpec): string;
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {boolean} true, when they are equal
 */
export function runtimeEqual(a: RuntimeSpec, b: RuntimeSpec): boolean;
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} merged
 */
export function mergeRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * @param {RuntimeSpec} a first (may be modified)
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} merged
 */
export function mergeRuntimeOwned(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {RuntimeSpec} result
 */
export function subtractRuntime(a: RuntimeSpec, b: RuntimeSpec): RuntimeSpec;
/**
 * @template T
 * @typedef {Map<string, T>} RuntimeSpecMapInnerMap
 * */
/**
 * @template T
 */
export class RuntimeSpecMap<T> {
  /**
   * @param {RuntimeSpecMap<T>=} clone copy form this
   */
  constructor(clone?: RuntimeSpecMap<T> | undefined);
  _mode: number;
  /** @type {RuntimeSpec} */
  _singleRuntime: RuntimeSpec;
  /** @type {T | undefined} */
  _singleValue: T | undefined;
  /** @type {RuntimeSpecMapInnerMap<T> | undefined} */
  _map: RuntimeSpecMapInnerMap<T>;
  /**
   * @param {RuntimeSpec} runtime the runtimes
   * @returns {T | undefined} value
   */
  get(runtime: RuntimeSpec): T | undefined;
  /**
   * @param {RuntimeSpec} runtime the runtimes
   * @returns {boolean} true, when the runtime is stored
   */
  has(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtimes
   * @param {T} value the value
   */
  set(runtime: RuntimeSpec, value: T): void;
  /**
   * @param {RuntimeSpec} runtime the runtimes
   * @param {() => TODO} computer function to compute the value
   * @returns {TODO} true, when the runtime was deleted
   */
  provide(runtime: RuntimeSpec, computer: () => TODO): TODO;
  /**
   * @param {RuntimeSpec} runtime the runtimes
   */
  delete(runtime: RuntimeSpec): void;
  /**
   * @param {RuntimeSpec} runtime the runtimes
   * @param {function(T | undefined): T} fn function to update the value
   */
  update(runtime: RuntimeSpec, fn: (arg0: T | undefined) => T): void;
  keys(): RuntimeSpec[];
  values(): IterableIterator<any>;
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
  [Symbol.iterator](): IterableIterator<RuntimeSpec>;
}
import SortableSet = require('./SortableSet');
