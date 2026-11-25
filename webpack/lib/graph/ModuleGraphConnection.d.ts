export = ModuleGraphConnection;
declare class ModuleGraphConnection {
    /**
     * Creates an instance of ModuleGraphConnection.
     * @param {Module | null} originModule the referencing module
     * @param {Dependency | null} dependency the referencing dependency
     * @param {Module} module the referenced module
     * @param {string=} explanation some extra detail
     * @param {boolean=} weak the reference is weak
     * @param {false | null | GetConditionFn=} condition condition for the connection
     */
    constructor(originModule: Module | null, dependency: Dependency | null, module: Module, explanation?: string | undefined, weak?: boolean | undefined, condition?: (false | null | Dependency.GetConditionFn) | undefined);
    /** @type {Module | null} */
    originModule: Module | null;
    /** @type {Module | null} */
    resolvedOriginModule: Module | null;
    /** @type {Dependency | null} */
    dependency: Dependency | null;
    /** @type {Module} */
    resolvedModule: Module;
    /** @type {Module} */
    module: Module;
    /** @type {boolean | undefined} */
    weak: boolean | undefined;
    /** @type {boolean} */
    conditional: boolean;
    /** @type {boolean} */
    _active: boolean;
    /** @type {false | null | GetConditionFn | undefined} */
    condition: false | null | Dependency.GetConditionFn | undefined;
    /** @type {Set<string> | undefined} */
    explanations: Set<string> | undefined;
    clone(): ModuleGraphConnection;
    /**
     * Adds the provided condition to the module graph connection.
     * @param {GetConditionFn} condition condition for the connection
     * @returns {void}
     */
    addCondition(condition: Dependency.GetConditionFn): void;
    /**
     * Adds the provided explanation to the module graph connection.
     * @param {string} explanation the explanation to add
     * @returns {void}
     */
    addExplanation(explanation: string): void;
    get explanation(): string;
    /**
     * Checks whether this module graph connection is active.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, if the connection is active
     */
    isActive(runtime: RuntimeSpec): boolean;
    /**
     * Checks whether this module graph connection is target active.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, if the connection is active
     */
    isTargetActive(runtime: RuntimeSpec): boolean;
    /**
     * Returns true: fully active, false: inactive, TRANSITIVE: direct module inactive, but transitive connection maybe active.
     * @param {RuntimeSpec} runtime the runtime
     * @returns {ConnectionState} true: fully active, false: inactive, TRANSITIVE: direct module inactive, but transitive connection maybe active
     */
    getActiveState(runtime: RuntimeSpec): ConnectionState;
    /**
     * Updates active using the provided value.
     * @param {boolean} value active or not
     * @returns {void}
     */
    setActive(value: boolean): void;
}
declare namespace ModuleGraphConnection {
    export { CIRCULAR_CONNECTION, TRANSITIVE_ONLY, addConnectionStates, ConnectionState };
}
import type Module from "../module/Module";
import type Dependency from "./Dependency";
import type { RuntimeSpec } from "../util/runtime";
/**
 * While determining the active state, this flag is used to signal a circular connection.
 */
declare const CIRCULAR_CONNECTION: unique symbol;
/** @import Dependency, { GetConditionFn } from "./Dependency" */
/** @import Module from "../module/Module" */
/** @import { RuntimeSpec } from "../util/runtime" */
/**
 * Module itself is not connected, but transitive modules are connected transitively.
 */
declare const TRANSITIVE_ONLY: unique symbol;
/** @typedef {boolean | typeof TRANSITIVE_ONLY | typeof CIRCULAR_CONNECTION} ConnectionState */
/**
 * Adds connection states.
 * @param {ConnectionState} a first
 * @param {ConnectionState} b second
 * @returns {ConnectionState} merged
 */
declare function addConnectionStates(a: ConnectionState, b: ConnectionState): ConnectionState;
type ConnectionState = boolean | typeof TRANSITIVE_ONLY | typeof CIRCULAR_CONNECTION;
