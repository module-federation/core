export = HarmonyImportSpecifierDependency;
declare class HarmonyImportSpecifierDependency extends HarmonyImportDependency {
  /**
   * @param {TODO} request request
   * @param {number} sourceOrder source order
   * @param {string[]} ids ids
   * @param {string} name name
   * @param {Range} range range
   * @param {TODO} exportPresenceMode export presence mode
   * @param {Assertions=} assertions assertions
   * @param {Range[]=} idRanges ranges for members of ids; the two arrays are right-aligned
   */
  constructor(
    request: TODO,
    sourceOrder: number,
    ids: string[],
    name: string,
    range: import('../javascript/JavascriptParser').Range,
    exportPresenceMode: TODO,
    assertions?: Assertions | undefined,
    idRanges?: import('../javascript/JavascriptParser').Range[] | undefined,
  );
  ids: string[];
  name: string;
  range: import('../javascript/JavascriptParser').Range;
  idRanges: import('../javascript/JavascriptParser').Range[];
  exportPresenceMode: TODO;
  /** @type {boolean | undefined} */
  namespaceObjectAsContext: boolean | undefined;
  call: any;
  directImport: any;
  shorthand: any;
  asiSafe: any;
  /** @type {Set<string> | boolean | undefined} */
  usedByExports: Set<string> | boolean | undefined;
  /** @type {Set<string> | undefined} */
  referencedPropertiesInDestructuring: Set<string> | undefined;
  get id(): void;
  getId(): void;
  setId(): void;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @returns {string[]} the imported ids
   */
  getIds(moduleGraph: ModuleGraph): string[];
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {string[]} ids the imported ids
   * @returns {void}
   */
  setIds(moduleGraph: ModuleGraph, ids: string[]): void;
  /**
   * @param {string[]=} ids ids
   * @returns {(string[] | ReferencedExport)[]} referenced exports
   */
  _getReferencedExportsInDestructuring(
    ids?: string[] | undefined,
  ): (string[] | ReferencedExport)[];
  /**
   * @param {ModuleGraph} moduleGraph module graph
   * @returns {number} effective mode
   */
  _getEffectiveExportPresenceLevel(moduleGraph: ModuleGraph): number;
  /**
   * @param {ModuleGraph} moduleGraph module graph
   * @returns {WebpackError[] | undefined} errors
   */
  _getErrors(moduleGraph: ModuleGraph): WebpackError[] | undefined;
}
declare namespace HarmonyImportSpecifierDependency {
  export {
    HarmonyImportSpecifierDependencyTemplate as Template,
    ReplaceSource,
    ChunkGraph,
    ExportsSpec,
    ReferencedExport,
    UpdateHashContext,
    DependencyTemplateContext,
    Module,
    BuildMeta,
    ModuleGraph,
    ModuleGraphConnection,
    ConnectionState,
    WebpackError,
    Assertions,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
  };
}
import HarmonyImportDependency = require('./HarmonyImportDependency');
type ModuleGraph = import('../ModuleGraph');
type ReferencedExport = import('../Dependency').ReferencedExport;
type WebpackError = import('../WebpackError');
type Assertions = import('../javascript/JavascriptParser').Assertions;
declare const HarmonyImportSpecifierDependencyTemplate_base: {
  new (): {
    apply(
      dependency: Dependency,
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
  getImportEmittedRuntime(
    module: import('../Module'),
    referencedModule: import('../Module'),
  ): boolean | import('../util/runtime').RuntimeSpec;
};
declare class HarmonyImportSpecifierDependencyTemplate extends HarmonyImportSpecifierDependencyTemplate_base {
  /**
   * @summary Determine which IDs in the id chain are actually referring to namespaces or imports,
   * and which are deeper member accessors on the imported object.  Only the former should be re-rendered.
   * @param {string[]} ids ids
   * @param {ModuleGraph} moduleGraph moduleGraph
   * @param {HarmonyImportSpecifierDependency} dependency dependency
   * @returns {string[]} generated code
   */
  _trimIdsToThoseImported(
    ids: string[],
    moduleGraph: ModuleGraph,
    dependency: HarmonyImportSpecifierDependency,
  ): string[];
  /**
   * @param {HarmonyImportSpecifierDependency} dep dependency
   * @param {ReplaceSource} source source
   * @param {DependencyTemplateContext} templateContext context
   * @param {string[]} ids ids
   * @returns {string} generated code
   */
  _getCodeForIds(
    dep: HarmonyImportSpecifierDependency,
    source: any,
    templateContext: DependencyTemplateContext,
    ids: string[],
  ): string;
}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type ExportsSpec = import('../Dependency').ExportsSpec;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
import Dependency = require('../Dependency');
