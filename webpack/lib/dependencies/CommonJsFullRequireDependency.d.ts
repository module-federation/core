export = CommonJsFullRequireDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../ExportsInfo").ExportInfoName} ExportInfoName */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/** @typedef {import("../util/chainedImports").IdRanges} IdRanges */
declare class CommonJsFullRequireDependency extends ModuleDependency {
  /**
   * @param {string} request the request string
   * @param {Range} range location in source code
   * @param {ExportInfoName[]} names accessed properties on module
   * @param {IdRanges=} idRanges ranges for members of ids; the two arrays are right-aligned
   */
  constructor(
    request: string,
    range: Range,
    names: ExportInfoName[],
    idRanges?: IdRanges | undefined,
  );
  names: string[];
  idRanges: import('../util/chainedImports').IdRanges;
  call: boolean;
  asiSafe: any;
}
declare namespace CommonJsFullRequireDependency {
  export {
    CommonJsFullRequireDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    ReferencedExports,
    DependencyTemplateContext,
    ModuleGraph,
    Range,
    ExportInfoName,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
    IdRanges,
  };
}
import ModuleDependency = require('./ModuleDependency');
declare const CommonJsFullRequireDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class CommonJsFullRequireDependencyTemplate extends CommonJsFullRequireDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type ReferencedExports = import('../Dependency').ReferencedExports;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
type ExportInfoName = import('../ExportsInfo').ExportInfoName;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type IdRanges = import('../util/chainedImports').IdRanges;
