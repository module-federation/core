export = ProvidedDependency;
declare class ProvidedDependency extends ModuleDependency {
  /**
   * @param {string} request request
   * @param {string} identifier identifier
   * @param {string[]} ids ids
   * @param {Range} range range
   */
  constructor(
    request: string,
    identifier: string,
    ids: string[],
    range: import('../javascript/JavascriptParser').Range,
  );
  identifier: string;
  ids: string[];
  range: import('../javascript/JavascriptParser').Range;
  _hashUpdate: string;
}
declare namespace ProvidedDependency {
  export {
    ProvidedDependencyTemplate as Template,
    ReplaceSource,
    ChunkGraph,
    ReferencedExport,
    UpdateHashContext,
    DependencyTemplateContext,
    DependencyTemplates,
    ModuleGraph,
    ModuleGraphConnection,
    RuntimeTemplate,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
declare const ProvidedDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class ProvidedDependencyTemplate extends ProvidedDependencyTemplate_base {}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type ReferencedExport = import('../Dependency').ReferencedExport;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type DependencyTemplates = import('../DependencyTemplates');
type ModuleGraph = import('../ModuleGraph');
type ModuleGraphConnection = import('../ModuleGraphConnection');
type RuntimeTemplate = import('../RuntimeTemplate');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
