export = ImportDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../AsyncDependenciesBlock")} AsyncDependenciesBlock */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class ImportDependency extends ModuleDependency {
  /**
   * @param {string} request the request
   * @param {Range} range expression range
   * @param {(string[][] | null)=} referencedExports list of referenced exports
   */
  constructor(
    request: string,
    range: import('../javascript/JavascriptParser').Range,
    referencedExports?: (string[][] | null) | undefined,
  );
  range: import('../javascript/JavascriptParser').Range;
  referencedExports: string[][];
}
declare namespace ImportDependency {
  export {
    ImportDependencyTemplate as Template,
    ReplaceSource,
    AsyncDependenciesBlock,
    ReferencedExport,
    DependencyTemplateContext,
    Module,
    BuildMeta,
    ModuleGraph,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
declare const ImportDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class ImportDependencyTemplate extends ImportDependencyTemplate_base {}
type ReplaceSource = any;
type AsyncDependenciesBlock = import('../AsyncDependenciesBlock');
type ReferencedExport = import('../Dependency').ReferencedExport;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
