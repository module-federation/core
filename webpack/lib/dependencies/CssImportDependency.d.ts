export = CssImportDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../css/CssParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class CssImportDependency extends ModuleDependency {
  /**
   * Example of dependency:
   *
   * \@import url("landscape.css") layer(forms) screen and (orientation: landscape) screen and (orientation: landscape);
   *
   * @param {string} request request
   * @param {Range} range range of the argument
   * @param {string | undefined} layer layer
   * @param {string | undefined} supports list of supports conditions
   * @param {string | undefined} media list of media conditions
   */
  constructor(
    request: string,
    range: import('../css/CssParser').Range,
    layer: string | undefined,
    supports: string | undefined,
    media: string | undefined,
  );
  range: import('../css/CssParser').Range;
  layer: string;
  supports: string;
  media: string;
}
declare namespace CssImportDependency {
  export {
    CssImportDependencyTemplate as Template,
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
declare const CssImportDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class CssImportDependencyTemplate extends CssImportDependencyTemplate_base {}
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
type Range = import('../css/CssParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
