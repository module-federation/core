export = CssIcssExportDependency;
/** @typedef {0 | 1 | 2 | 3 | 4} ExportMode */
/** @typedef {0 | 1 | 2} ExportType */
declare class CssIcssExportDependency extends NullDependency {
  /**
   * Example of dependency:
   *
   * :export { LOCAL_NAME: EXPORT_NAME }
   * @param {string} name export name
   * @param {string | [string, string, boolean]} value export value or true when we need interpolate name as a value
   * @param {Range=} range range
   * @param {boolean=} interpolate true when value need to be interpolated, otherwise false
   * @param {ExportMode=} exportMode export mode
   * @param {ExportType=} exportType export type
   */
  constructor(
    name: string,
    value: string | [string, string, boolean],
    range?: Range | undefined,
    interpolate?: boolean | undefined,
    exportMode?: ExportMode | undefined,
    exportType?: ExportType | undefined,
  );
  name: string;
  value: string | [string, string, boolean];
  range: import('../css/CssParser').Range;
  interpolate: boolean;
  exportMode: ExportMode;
  exportType: ExportType;
  _hashUpdate: string;
  /**
   * @param {string} name export name
   * @param {CssGeneratorExportsConvention} convention convention of the export name
   * @returns {string[]} convention results
   */
  getExportsConventionNames(
    name: string,
    convention: CssGeneratorExportsConvention,
  ): string[];
  _conventionNames: string[];
}
declare namespace CssIcssExportDependency {
  export {
    CssIcssExportDependencyTemplate as Template,
    EXPORT_MODE,
    EXPORT_TYPE,
    ReplaceSource,
    CssGeneratorExportsConvention,
    CssGeneratorLocalIdentName,
    CssModule,
    Dependency,
    ReferencedExports,
    ExportsSpec,
    UpdateHashContext,
    DependencyTemplateContext,
    ModuleGraph,
    CssGenerator,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
    ChunkGraph,
    RuntimeTemplate,
    Range,
    ExportMode,
    ExportType,
  };
}
import NullDependency = require('./NullDependency');
declare const CssIcssExportDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class CssIcssExportDependencyTemplate extends CssIcssExportDependencyTemplate_base {
  /**
   * @param {string} symbol the name of symbol
   * @param {DependencyTemplateContext} templateContext the context object
   * @returns {string | undefined} found reference
   */
  static findReference(
    symbol: string,
    templateContext: DependencyTemplateContext,
  ): string | undefined;
  /**
   * @param {string} value value to identifier
   * @param {Dependency} dependency the dependency for which the template should be applied
   * @param {DependencyTemplateContext} templateContext the context object
   * @returns {string} identifier
   */
  static getIdentifier(
    value: string,
    dependency: Dependency,
    templateContext: DependencyTemplateContext,
  ): string;
  /**
   * @param {Dependency} dependency the dependency for which the template should be applied
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {DependencyTemplateContext} templateContext the context object
   * @returns {void}
   */
  apply(
    dependency: Dependency,
    source: ReplaceSource,
    templateContext: DependencyTemplateContext,
  ): void;
}
declare var EXPORT_MODE: Record<
  'NONE' | 'REPLACE' | 'APPEND' | 'ONCE' | 'SELF_REFERENCE',
  ExportMode
>;
declare var EXPORT_TYPE: Record<
  'NORMAL' | 'CUSTOM_VARIABLE' | 'GRID_CUSTOM_IDENTIFIER',
  ExportType
>;
type ReplaceSource = import('webpack-sources').ReplaceSource;
type CssGeneratorExportsConvention =
  import('../../declarations/WebpackOptions').CssGeneratorExportsConvention;
type CssGeneratorLocalIdentName =
  import('../../declarations/WebpackOptions').CssGeneratorLocalIdentName;
type CssModule = import('../CssModule');
type Dependency = import('../Dependency');
type ReferencedExports = import('../Dependency').ReferencedExports;
type ExportsSpec = import('../Dependency').ExportsSpec;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').CssDependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type CssGenerator = import('../css/CssGenerator');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type ChunkGraph = import('../ChunkGraph');
type RuntimeTemplate = import('../RuntimeTemplate');
type Range = import('../css/CssParser').Range;
type ExportMode = 0 | 1 | 2 | 3 | 4;
type ExportType = 0 | 1 | 2;
