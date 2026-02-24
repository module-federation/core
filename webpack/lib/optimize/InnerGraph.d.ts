export function addUsage(
  state: ParserState,
  symbol: TopLevelSymbol | null,
  usage: Usage,
): void;
export function addVariableUsage(
  parser: JavascriptParser,
  name: string,
  usage: Usage,
): void;
export function bailout(parserState: ParserState): void;
export function enable(parserState: ParserState): void;
export function getDependencyUsedByExportsCondition(
  dependency: Dependency,
  usedByExports: UsedByExports | undefined,
  moduleGraph: ModuleGraph,
): null | false | GetConditionFn;
export function getTopLevelSymbol(state: ParserState): TopLevelSymbol | void;
export function inferDependencyUsage(state: ParserState): void;
export function isDependencyUsedByExports(
  dependency: Dependency,
  usedByExports: UsedByExports | undefined,
  moduleGraph: ModuleGraph,
  runtime: RuntimeSpec,
): boolean;
export function isEnabled(parserState: ParserState): boolean;
export function onUsage(
  state: ParserState,
  onUsageCallback: UsageCallback,
): void;
export function setTopLevelSymbol(
  state: ParserState,
  symbol: TopLevelSymbol | undefined,
): void;
export function tagTopLevelSymbol(
  parser: JavascriptParser,
  name: string,
): TopLevelSymbol | undefined;
export type Dependency = import('../Dependency');
export type GetConditionFn = import('../Dependency').GetConditionFn;
export type Module = import('../Module');
export type ModuleGraph = import('../ModuleGraph');
export type ParserState = import('../Parser').ParserState;
export type RuntimeSpec = import('../util/runtime').RuntimeSpec;
export type InnerGraphValueSet = Set<string | TopLevelSymbol>;
export type InnerGraphValue = InnerGraphValueSet | true;
export type InnerGraphKey = TopLevelSymbol | null;
export type InnerGraph = Map<InnerGraphKey, InnerGraphValue | undefined>;
export type UsageCallback = (value: boolean | Set<string> | undefined) => void;
export type StateObject = {
  innerGraph: InnerGraph;
  currentTopLevelSymbol?: TopLevelSymbol | undefined;
  usageCallbackMap: Map<TopLevelSymbol, Set<UsageCallback>>;
};
export type State = false | StateObject;
export type Usage = string | TopLevelSymbol | true;
export type UsedByExports = Set<string> | boolean;
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").GetConditionFn} GetConditionFn */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../Parser").ParserState} ParserState */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/** @typedef {Set<string | TopLevelSymbol>} InnerGraphValueSet */
/** @typedef {InnerGraphValueSet | true} InnerGraphValue */
/** @typedef {TopLevelSymbol | null} InnerGraphKey */
/** @typedef {Map<InnerGraphKey, InnerGraphValue | undefined>} InnerGraph */
/** @typedef {(value: boolean | Set<string> | undefined) => void} UsageCallback */
/**
 * @typedef {object} StateObject
 * @property {InnerGraph} innerGraph
 * @property {TopLevelSymbol=} currentTopLevelSymbol
 * @property {Map<TopLevelSymbol, Set<UsageCallback>>} usageCallbackMap
 */
/** @typedef {false | StateObject} State */
export class TopLevelSymbol {
  /**
   * @param {string} name name of the variable
   */
  constructor(name: string);
  name: string;
}
import JavascriptParser = require('../javascript/JavascriptParser');
export const topLevelSymbolTag: unique symbol;
