export = ModuleGraphConnection;
declare class ModuleGraphConnection {
  /**
   * @param {Module|null} originModule the referencing module
   * @param {Dependency|null} dependency the referencing dependency
   * @param {Module} module the referenced module
   * @param {string=} explanation some extra detail
   * @param {boolean=} weak the reference is weak
   * @param {false | function(ModuleGraphConnection, RuntimeSpec): ConnectionState=} condition condition for the connection
   */
  constructor(
    originModule: Module | null,
    dependency: Dependency | null,
    module: Module,
    explanation?: string | undefined,
    weak?: boolean | undefined,
    condition?:
      | (
          | false
          | ((
              arg0: ModuleGraphConnection,
              arg1: RuntimeSpec,
            ) => ConnectionState)
        )
      | undefined,
  );
  originModule: import('./Module');
  resolvedOriginModule: import('./Module');
  dependency: import('./Dependency');
  resolvedModule: import('./Module');
  module: import('./Module');
  weak: boolean;
  conditional: boolean;
  _active: boolean;
  /** @type {(function(ModuleGraphConnection, RuntimeSpec): ConnectionState) | undefined} */
  condition: (
    arg0: ModuleGraphConnection,
    arg1: RuntimeSpec,
  ) => ConnectionState;
  /** @type {Set<string> | undefined} */
  explanations: Set<string> | undefined;
  clone(): import('./ModuleGraphConnection');
  /**
   * @param {function(ModuleGraphConnection, RuntimeSpec): ConnectionState} condition condition for the connection
   * @returns {void}
   */
  addCondition(
    condition: (
      arg0: ModuleGraphConnection,
      arg1: RuntimeSpec,
    ) => ConnectionState,
  ): void;
  /**
   * @param {string} explanation the explanation to add
   * @returns {void}
   */
  addExplanation(explanation: string): void;
  get explanation(): string;
  set active(arg: void);
  get active(): void;
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
}
declare namespace ModuleGraphConnection {
  export {
    addConnectionStates,
    TRANSITIVE_ONLY,
    CIRCULAR_CONNECTION,
    Dependency,
    Module,
    RuntimeSpec,
    ConnectionState,
  };
}
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type ConnectionState =
  | boolean
  | typeof TRANSITIVE_ONLY
  | typeof CIRCULAR_CONNECTION;
type Module = import('./Module');
type Dependency = import('./Dependency');
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
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./util/runtime").RuntimeSpec} RuntimeSpec */
/**
 * Module itself is not connected, but transitive modules are connected transitively.
 */
declare const TRANSITIVE_ONLY: unique symbol;
/**
 * While determining the active state, this flag is used to signal a circular connection.
 */
declare const CIRCULAR_CONNECTION: unique symbol;
