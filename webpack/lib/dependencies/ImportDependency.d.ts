export = ImportDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../AsyncDependenciesBlock")} AsyncDependenciesBlock */
/** @typedef {import("../Dependency").RawReferencedExports} RawReferencedExports */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/** @typedef {import("./ImportPhase").ImportPhaseType} ImportPhaseType */
declare class ImportDependency extends ModuleDependency {
  /**
   * @param {string} request the request
   * @param {Range} range expression range
   * @param {RawReferencedExports | null} referencedExports list of referenced exports
   * @param {ImportPhaseType} phase import phase
   * @param {ImportAttributes=} attributes import attributes
   */
  constructor(
    request: string,
    range: Range,
    referencedExports: RawReferencedExports | null,
    phase: ImportPhaseType,
    attributes?: ImportAttributes | undefined,
  );
  referencedExports: Dependency.RawReferencedExports;
  phase: import('./ImportPhase').ImportPhaseType;
  attributes: import('../javascript/JavascriptParser').ImportAttributes;
}
declare namespace ImportDependency {
  export {
    ImportDependencyTemplate as Template,
    ReplaceSource,
    AsyncDependenciesBlock,
    RawReferencedExports,
    ReferencedExports,
    DependencyTemplateContext,
    Module,
    BuildMeta,
    ModuleGraph,
    ImportAttributes,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
    ImportPhaseType,
  };
}
import ModuleDependency = require('./ModuleDependency');
import Dependency = require('../Dependency');
declare const ImportDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class ImportDependencyTemplate extends ImportDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type AsyncDependenciesBlock = import('../AsyncDependenciesBlock');
type RawReferencedExports = import('../Dependency').RawReferencedExports;
type ReferencedExports = import('../Dependency').ReferencedExports;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
type ModuleGraph = import('../ModuleGraph');
type ImportAttributes =
  import('../javascript/JavascriptParser').ImportAttributes;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type ImportPhaseType = import('./ImportPhase').ImportPhaseType;
