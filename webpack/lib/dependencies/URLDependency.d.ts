export = URLDependency;
declare class URLDependency extends ModuleDependency {
  /**
   * @param {string} request request
   * @param {Range} range range of the arguments of new URL( |> ... <| )
   * @param {Range} outerRange range of the full |> new URL(...) <|
   * @param {boolean=} relative use relative urls instead of absolute with base uri
   */
  constructor(
    request: string,
    range: import('../javascript/JavascriptParser').Range,
    outerRange: import('../javascript/JavascriptParser').Range,
    relative?: boolean | undefined,
  );
  range: import('../javascript/JavascriptParser').Range;
  outerRange: import('../javascript/JavascriptParser').Range;
  relative: boolean;
  /** @type {Set<string> | boolean | undefined} */
  usedByExports: Set<string> | boolean | undefined;
}
declare namespace URLDependency {
  export {
    URLDependencyTemplate as Template,
    ReplaceSource,
    ChunkGraph,
    Dependency,
    UpdateHashContext,
    DependencyTemplateContext,
    Module,
    ModuleGraph,
    ModuleGraphConnection,
    ConnectionState,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
declare const URLDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class URLDependencyTemplate extends URLDependencyTemplate_base {}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type Dependency = import('../Dependency');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
