export function bailout(parserState: ParserState): void;
export function enable(parserState: ParserState): void;
export function isEnabled(parserState: ParserState): boolean;
export function addUsage(
  state: ParserState,
  symbol: TopLevelSymbol | null,
  usage: string | TopLevelSymbol | true,
): void;
export function addVariableUsage(
  parser: JavascriptParser,
  name: string,
  usage: string | TopLevelSymbol | true,
): void;
export function inferDependencyUsage(state: ParserState): void;
export function onUsage(
  state: ParserState,
  onUsageCallback: UsageCallback,
): void;
export function setTopLevelSymbol(
  state: ParserState,
  symbol: TopLevelSymbol | undefined,
): void;
export function getTopLevelSymbol(state: ParserState): TopLevelSymbol | void;
export function tagTopLevelSymbol(
  parser: JavascriptParser,
  name: string,
): TopLevelSymbol | undefined;
export function isDependencyUsedByExports(
  dependency: Dependency,
  usedByExports: Set<string> | boolean,
  moduleGraph: ModuleGraph,
  runtime: RuntimeSpec,
): boolean;
export function getDependencyUsedByExportsCondition(
  dependency: Dependency,
  usedByExports: Set<string> | boolean | undefined,
  moduleGraph: ModuleGraph,
):
  | null
  | false
  | ((arg0: ModuleGraphConnection, arg1: RuntimeSpec) => ConnectionState);
export type AnyNode = import('estree').Node;
export type Dependency = import('../Dependency');
export type ModuleGraph = import('../ModuleGraph');
export type ModuleGraphConnection = import('../ModuleGraphConnection');
export type ConnectionState =
  import('../ModuleGraphConnection').ConnectionState;
export type ParserState = import('../Parser').ParserState;
export type JavascriptParser = import('../javascript/JavascriptParser');
export type RuntimeSpec = import('../util/runtime').RuntimeSpec;
export type InnerGraph = Map<
  TopLevelSymbol | null,
  Set<string | TopLevelSymbol> | true | undefined
>;
export type UsageCallback = (arg0: boolean | Set<string> | undefined) => void;
export type StateObject = {
  innerGraph: InnerGraph;
  currentTopLevelSymbol?: TopLevelSymbol | undefined;
  usageCallbackMap: Map<TopLevelSymbol, Set<UsageCallback>>;
};
export type State = false | StateObject;
export class TopLevelSymbol {
  /**
   * @param {string} name name of the variable
   */
  constructor(name: string);
  name: string;
}
export const topLevelSymbolTag: unique symbol;
