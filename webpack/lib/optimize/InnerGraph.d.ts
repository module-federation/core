export function getDependencyUsedByExportsCondition(dependency: Dependency, moduleGraph: ModuleGraph): null | false | Dependency.GetConditionFn;
export function getInnerGraphUtils(compilation: Compilation): InnerGraphUtils;
export type InnerGraphUtils = {
    enable: (parserState: ParserState) => void;
    bailout: (parserState: ParserState) => void;
    isEnabled: (parserState: ParserState) => boolean;
    addUsage: (parserState: ParserState, symbol: TopLevelSymbol | null, usage: Usage) => void;
    onUsage: (parserState: ParserState, onUsageCallback: UsageCallback) => void;
    setTopLevelSymbol: (parserState: ParserState, symbol: TopLevelSymbol | undefined) => void;
    getTopLevelSymbol: (parserState: ParserState) => TopLevelSymbol | void;
    tagTopLevelSymbol: (parser: JavascriptParser, name: string, pure?: PureCondition) => TopLevelSymbol | undefined;
    addVariableUsage: (parser: JavascriptParser, name: string, usage: Usage) => void;
    inferDependencyUsage: (module: Module) => void;
    release: (module: Module) => void;
};
export type PureCondition = boolean | ((compilation: Compilation, module: Module) => boolean);
export type InnerGraphValueSet = Set<string | TopLevelSymbol>;
export type InnerGraphValue = InnerGraphValueSet | true;
export type InnerGraphKey = TopLevelSymbol | null;
export type InnerGraph = Map<InnerGraphKey, InnerGraphValue | undefined>;
export type UsageCallback = (value: boolean | Set<string> | undefined, module: Module) => void;
/**
 * Defines the state object type used by this module.
 */
export type StateObject = {
    innerGraph: InnerGraph;
    currentTopLevelSymbol?: TopLevelSymbol | undefined;
    usageCallbackMap: Map<TopLevelSymbol, Set<UsageCallback>>;
};
export type State = false | StateObject;
export type Usage = string | TopLevelSymbol | true;
export type UsedByExports = Set<string> | boolean;
export type DependencyWithUsedByExports = Dependency & {
    usedByExports: UsedByExports | undefined;
};
/** @import Compilation from "../Compilation" */
/** @import Dependency, { GetConditionFn } from "../graph/Dependency" */
/** @import Module from "../module/Module" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import { ParserState } from "../module/Parser" */
/** @import { RuntimeSpec } from "../util/runtime" */
/** @typedef {boolean | ((compilation: Compilation, module: Module) => boolean)} PureCondition */
/** @typedef {Set<string | TopLevelSymbol>} InnerGraphValueSet */
/** @typedef {InnerGraphValueSet | true} InnerGraphValue */
/** @typedef {TopLevelSymbol | null} InnerGraphKey */
/** @typedef {Map<InnerGraphKey, InnerGraphValue | undefined>} InnerGraph */
/** @typedef {(value: boolean | Set<string> | undefined, module: Module) => void} UsageCallback */
/**
 * Defines the state object type used by this module.
 * @typedef {object} StateObject
 * @property {InnerGraph} innerGraph
 * @property {TopLevelSymbol=} currentTopLevelSymbol
 * @property {Map<TopLevelSymbol, Set<UsageCallback>>} usageCallbackMap
 */
/** @typedef {false | StateObject} State */
/** @typedef {string | TopLevelSymbol | true} Usage */
/** @typedef {Set<string> | boolean} UsedByExports */
/** @typedef {Dependency & { usedByExports: UsedByExports | undefined }} DependencyWithUsedByExports */
export class TopLevelSymbol {
    /**
     * Creates an instance of TopLevelSymbol.
     * @param {string} name name of the variable
     * @param {PureCondition=} pure pure condition
     */
    constructor(name: string, pure?: PureCondition | undefined);
    /** @type {string} */
    name: string;
    /** @type {boolean} */
    conditional: boolean;
    /** @type {boolean} */
    _pure: boolean;
    /** @type {((compilation: Compilation, module: Module) => boolean) | undefined} */
    pureFn: ((compilation: Compilation, module: Module) => boolean) | undefined;
    /**
     * Sets the pure condition
     * @param {PureCondition} pure pure condition
     * @returns {void}
     */
    setPure(pure: PureCondition): void;
    /**
     * @param {Compilation} compilation compilation
     * @param {Module} module module
     * @returns {boolean} if the symbol is pure
     */
    isPure(compilation: Compilation, module: Module): boolean;
}
import type Dependency from "../graph/Dependency";
import type ModuleGraph from "../graph/ModuleGraph";
import type Compilation from "../Compilation";
export const topLevelSymbolTag: unique symbol;
import type { ParserState } from "../module/Parser";
import JavascriptParser = require("../javascript/JavascriptParser");
import type Module from "../module/Module";
