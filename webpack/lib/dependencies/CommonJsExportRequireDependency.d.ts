export = CommonJsExportRequireDependency;
declare class CommonJsExportRequireDependency extends ModuleDependency {
  /**
   * @param {Range} range range
   * @param {Range} valueRange value range
   * @param {CommonJSDependencyBaseKeywords} base base
   * @param {string[]} names names
   * @param {string} request request
   * @param {string[]} ids ids
   * @param {boolean} resultUsed true, when the result is used
   */
  constructor(
    range: import('../javascript/JavascriptParser').Range,
    valueRange: import('../javascript/JavascriptParser').Range,
    base: CommonJSDependencyBaseKeywords,
    names: string[],
    request: string,
    ids: string[],
    resultUsed: boolean,
  );
  range: import('../javascript/JavascriptParser').Range;
  valueRange: import('../javascript/JavascriptParser').Range;
  base: import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
  names: string[];
  ids: string[];
  resultUsed: boolean;
  asiSafe: any;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @returns {string[]} the imported id
   */
  getIds(moduleGraph: ModuleGraph): string[];
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {string[]} ids the imported ids
   * @returns {void}
   */
  setIds(moduleGraph: ModuleGraph, ids: string[]): void;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {RuntimeSpec} runtime the runtime
   * @param {Module} importedModule the imported module (optional)
   * @returns {{exports?: Set<string>, checked?: Set<string>}} information
   */
  getStarReexports(
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec,
    importedModule?: Module,
  ): {
    exports?: Set<string>;
    checked?: Set<string>;
  };
}
declare namespace CommonJsExportRequireDependency {
  export {
    CommonJsExportRequireDependencyTemplate as Template,
    ReplaceSource,
    ExportsSpec,
    ReferencedExport,
    TRANSITIVE,
    DependencyTemplateContext,
    Module,
    ModuleGraph,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
    CommonJSDependencyBaseKeywords,
  };
}
import ModuleDependency = require('./ModuleDependency');
type ModuleGraph = import('../ModuleGraph');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type Module = import('../Module');
type CommonJSDependencyBaseKeywords =
  import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
declare const CommonJsExportRequireDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class CommonJsExportRequireDependencyTemplate extends CommonJsExportRequireDependencyTemplate_base {}
type ReplaceSource = any;
type ExportsSpec = import('../Dependency').ExportsSpec;
type ReferencedExport = import('../Dependency').ReferencedExport;
type TRANSITIVE = import('../Dependency').TRANSITIVE;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
