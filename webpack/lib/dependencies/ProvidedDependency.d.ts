export = ProvidedDependency;
declare class ProvidedDependency extends ModuleDependency {
  /**
   * @param {string} request request
   * @param {string} identifier identifier
   * @param {ExportInfoName[]} ids ids
   * @param {Range} range range
   */
  constructor(
    request: string,
    identifier: string,
    ids: ExportInfoName[],
    range: Range,
  );
  identifier: string;
  ids: string[];
  _hashUpdate: string;
}
declare namespace ProvidedDependency {
  export {
    ProvidedDependencyTemplate as Template,
    ReplaceSource,
    ReferencedExports,
    UpdateHashContext,
    DependencyTemplateContext,
    ModuleGraph,
    ModuleGraphConnection,
    ExportInfoName,
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
type ReplaceSource = import('webpack-sources').ReplaceSource;
type ReferencedExports = import('../Dependency').ReferencedExports;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ExportInfoName = import('../ExportsInfo').ExportInfoName;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
