export = ExternalModuleDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../dependencies/ExternalModuleInitFragment").ArrayImportSpecifiers} ArrayImportSpecifiers */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ExternalModuleDependency extends CachedConstDependency {
  /**
   * @param {string} module module
   * @param {ArrayImportSpecifiers} importSpecifiers import specifiers
   * @param {string | undefined} defaultImport default import
   * @param {string} expression expression
   * @param {Range | null} range range
   * @param {string} identifier identifier
   * @param {number=} place place where we inject the expression
   */
  constructor(
    module: string,
    importSpecifiers: ArrayImportSpecifiers,
    defaultImport: string | undefined,
    expression: string,
    range: Range | null,
    identifier: string,
    place?: number | undefined,
  );
  importedModule: string;
  specifiers: ExternalModuleInitFragment.ArrayImportSpecifiers;
  default: string;
}
declare namespace ExternalModuleDependency {
  export {
    ExternalModuleDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Range,
    ArrayImportSpecifiers,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import CachedConstDependency = require('./CachedConstDependency');
import ExternalModuleInitFragment = require('./ExternalModuleInitFragment');
declare const ExternalModuleDependencyTemplate_base: {
  new (): {
    apply(
      dependency: CachedConstDependency.Dependency,
      source: CachedConstDependency.ReplaceSource,
      {
        initFragments,
        chunkInitFragments,
      }: CachedConstDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class ExternalModuleDependencyTemplate extends ExternalModuleDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ArrayImportSpecifiers =
  import('../dependencies/ExternalModuleInitFragment').ArrayImportSpecifiers;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
