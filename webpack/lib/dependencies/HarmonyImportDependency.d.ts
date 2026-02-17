export = HarmonyImportDependency;
declare class HarmonyImportDependency extends ModuleDependency {
  /**
   *
   * @param {string} request request string
   * @param {number} sourceOrder source order
   * @param {Assertions=} assertions import assertions
   */
  constructor(
    request: string,
    sourceOrder: number,
    assertions?: Assertions | undefined,
  );
  sourceOrder: number;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @returns {string} name of the variable for the import
   */
  getImportVar(moduleGraph: ModuleGraph): string;
  /**
   * @param {boolean} update create new variables or update existing one
   * @param {DependencyTemplateContext} templateContext the template context
   * @returns {[string, string]} the import statement and the compat statement
   */
  getImportStatement(
    update: boolean,
    {
      runtimeTemplate,
      module,
      moduleGraph,
      chunkGraph,
      runtimeRequirements,
    }: DependencyTemplateContext,
  ): [string, string];
  /**
   * @param {ModuleGraph} moduleGraph module graph
   * @param {string[]} ids imported ids
   * @param {string} additionalMessage extra info included in the error message
   * @returns {WebpackError[] | undefined} errors
   */
  getLinkingErrors(
    moduleGraph: ModuleGraph,
    ids: string[],
    additionalMessage: string,
  ): WebpackError[] | undefined;
}
declare namespace HarmonyImportDependency {
  export {
    HarmonyImportDependencyTemplate as Template,
    ExportPresenceModes,
    ReplaceSource,
    Source,
    ChunkGraph,
    ReferencedExport,
    UpdateHashContext,
    DependencyTemplateContext,
    Module,
    ModuleGraph,
    RuntimeTemplate,
    WebpackError,
    Assertions,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
type ModuleGraph = import('../ModuleGraph');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type WebpackError = import('../WebpackError');
type Assertions = import('../javascript/JavascriptParser').Assertions;
declare const HarmonyImportDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class HarmonyImportDependencyTemplate extends HarmonyImportDependencyTemplate_base {
  /**
   *
   * @param {Module} module the module
   * @param {Module} referencedModule the referenced module
   * @returns {RuntimeSpec | boolean} runtimeCondition in which this import has been emitted
   */
  static getImportEmittedRuntime(
    module: Module,
    referencedModule: Module,
  ): RuntimeSpec | boolean;
}
declare namespace ExportPresenceModes {
  const NONE: 0;
  const WARN: 1;
  const AUTO: 2;
  const ERROR: 3;
  function fromUserOption(str: any): 0 | 2 | 1 | 3;
}
type ReplaceSource = any;
type Source = any;
type ChunkGraph = import('../ChunkGraph');
type ReferencedExport = import('../Dependency').ReferencedExport;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type Module = import('../Module');
type RuntimeTemplate = import('../RuntimeTemplate');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
