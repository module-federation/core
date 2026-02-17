export = CssUrlDependency;
declare class CssUrlDependency extends ModuleDependency {
  /**
   * @param {string} request request
   * @param {Range} range range of the argument
   * @param {"string" | "url"} urlType dependency type e.g. url() or string
   */
  constructor(
    request: string,
    range: import('../javascript/JavascriptParser').Range,
    urlType: 'string' | 'url',
  );
  range: import('../javascript/JavascriptParser').Range;
  urlType: 'string' | 'url';
}
declare namespace CssUrlDependency {
  export {
    CssUrlDependencyTemplate as Template,
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
declare const CssUrlDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class CssUrlDependencyTemplate extends CssUrlDependencyTemplate_base {}
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
