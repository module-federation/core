export = ModuleGraphConnection;
declare class ModuleGraphConnection {
  /**
   * @param {Module | null} originModule the referencing module
   * @param {Dependency | null} dependency the referencing dependency
   * @param {Module} module the referenced module
   * @param {string=} explanation some extra detail
   * @param {boolean=} weak the reference is weak
   * @param {false | null | GetConditionFn | undefined} condition condition for the connection
   */
  constructor(
    originModule: Module | null,
    dependency: Dependency | null,
    module: Module,
    explanation?: string | undefined,
    weak?: boolean | undefined,
    condition?: false | null | GetConditionFn | undefined,
  );
  originModule: import('./Module');
  resolvedOriginModule: import('./Module');
  dependency: import('./Dependency');
  resolvedModule: import('./Module');
  module: import('./Module');
  weak: boolean;
  conditional: boolean;
  _active: boolean;
  condition: import('./Dependency').GetConditionFn;
  /** @type {Set<string> | undefined} */
  explanations: Set<string> | undefined;
  clone(): ModuleGraphConnection;
  /**
   * @param {GetConditionFn} condition condition for the connection
   * @returns {void}
   */
  addCondition(condition: GetConditionFn): void;
  /**
   * @param {string} explanation the explanation to add
   * @returns {void}
   */
  addExplanation(explanation: string): void;
  get explanation(): string;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, if the connection is active
   */
  isActive(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, if the connection is active
   */
  isTargetActive(runtime: RuntimeSpec): boolean;
  /**
   * @param {RuntimeSpec} runtime the runtime
   * @returns {ConnectionState} true: fully active, false: inactive, TRANSITIVE: direct module inactive, but transitive connection maybe active
   */
  getActiveState(runtime: RuntimeSpec): ConnectionState;
  /**
   * @param {boolean} value active or not
   * @returns {void}
   */
  setActive(value: boolean): void;
  set active(value: void);
  get active(): void;
}
declare namespace ModuleGraphConnection {
  export {
    CIRCULAR_CONNECTION,
    TRANSITIVE_ONLY,
    addConnectionStates,
    Dependency,
    GetConditionFn,
    Module,
    RuntimeSpec,
    ConnectionState,
  };
}
type CIRCULAR_CONNECTION = typeof CIRCULAR_CONNECTION;
declare const CIRCULAR_CONNECTION: typeof CIRCULAR_CONNECTION;
type TRANSITIVE_ONLY = typeof TRANSITIVE_ONLY;
declare const TRANSITIVE_ONLY: typeof TRANSITIVE_ONLY;
/** @typedef {boolean | typeof TRANSITIVE_ONLY | typeof CIRCULAR_CONNECTION} ConnectionState */
/**
 * @param {ConnectionState} a first
 * @param {ConnectionState} b second
 * @returns {ConnectionState} merged
 */
declare function addConnectionStates(
  a: ConnectionState,
  b: ConnectionState,
): ConnectionState;
type Dependency = import('./Dependency');
type GetConditionFn = import('./Dependency').GetConditionFn;
type Module = import('./Module');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type ConnectionState =
  | boolean
  | typeof TRANSITIVE_ONLY
  | typeof CIRCULAR_CONNECTION;
/**
 * While determining the active state, this flag is used to signal a circular connection.
 */
declare const CIRCULAR_CONNECTION: unique symbol;
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Dependency").GetConditionFn} GetConditionFn */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./util/runtime").RuntimeSpec} RuntimeSpec */
/**
 * Module itself is not connected, but transitive modules are connected transitively.
 */
declare const TRANSITIVE_ONLY: unique symbol;
