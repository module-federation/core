export = CssIcssImportDependency;
declare class CssIcssImportDependency extends CssImportDependency {
  /**
   * Example of dependency:
   *
   * :import('./style.css') { value: name }
   * @param {string} request request request path which needs resolving
   * @param {Range} range the range of dependency
   * @param {"local" | "global"} mode mode of the parsed CSS
   * @param {string} name name
   * @param {string=} exportName export value
   * @param {ExportMode=} exportMode export mode
   * @param {ExportType=} exportType export type
   */
  constructor(
    request: string,
    range: Range,
    mode: 'local' | 'global',
    name: string,
    exportName?: string | undefined,
    exportMode?: ExportMode | undefined,
    exportType?: ExportType | undefined,
  );
  name: string;
  value: string;
  interpolate: boolean;
  exportMode: import('./CssIcssExportDependency').ExportMode;
  exportType: import('./CssIcssExportDependency').ExportType;
  /**
   * @param {string} name export name
   * @param {CssGeneratorExportsConvention} convention convention of the export name
   * @returns {string[]} convention results
   */
  getExportsConventionNames(
    name: string,
    convention: CssGeneratorExportsConvention,
  ): string[];
}
declare namespace CssIcssImportDependency {
  export {
    CssIcssImportDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Module,
    CssModule,
    ModuleGraph,
    RuntimeSpec,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    ReferencedExports,
    CssGeneratorExportsConvention,
    ExportMode,
    ExportType,
  };
}
import CssImportDependency = require('./CssImportDependency');
declare const CssIcssImportDependencyTemplate_base: {
  new (): {
    apply(
      dependency: CssImportDependency.Dependency,
      source: CssImportDependency.ReplaceSource,
      templateContext: CssImportDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class CssIcssImportDependencyTemplate extends CssIcssImportDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').CssDependencyTemplateContext;
type Module = import('../Module');
type CssModule = import('../CssModule');
type ModuleGraph = import('../ModuleGraph');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type ReferencedExports = import('../Dependency').ReferencedExports;
type CssGeneratorExportsConvention =
  import('../../declarations/WebpackOptions').CssGeneratorExportsConvention;
type ExportMode = import('./CssIcssExportDependency').ExportMode;
type ExportType = import('./CssIcssExportDependency').ExportType;
