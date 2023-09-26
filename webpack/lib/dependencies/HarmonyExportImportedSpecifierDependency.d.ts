export = HarmonyExportImportedSpecifierDependency;
declare class HarmonyExportImportedSpecifierDependency extends HarmonyImportDependency {
  /**
   * @param {string} request the request string
   * @param {number} sourceOrder the order in the original source file
   * @param {string[]} ids the requested export name of the imported module
   * @param {string | null} name the export name of for this module
   * @param {Set<string>} activeExports other named exports in the module
   * @param {ReadonlyArray<HarmonyExportImportedSpecifierDependency> | Iterable<HarmonyExportImportedSpecifierDependency> | null} otherStarExports other star exports in the module before this import
   * @param {number} exportPresenceMode mode of checking export names
   * @param {HarmonyStarExportsList | null} allStarExports all star exports in the module
   * @param {Assertions=} assertions import assertions
   */
  constructor(
    request: string,
    sourceOrder: number,
    ids: string[],
    name: string | null,
    activeExports: Set<string>,
    otherStarExports:
      | ReadonlyArray<HarmonyExportImportedSpecifierDependency>
      | Iterable<HarmonyExportImportedSpecifierDependency>
      | null,
    exportPresenceMode: number,
    allStarExports: HarmonyStarExportsList | null,
    assertions?: Assertions | undefined,
  );
  ids: string[];
  name: string;
  activeExports: Set<string>;
  otherStarExports:
    | readonly import('./HarmonyExportImportedSpecifierDependency')[]
    | Iterable<import('./HarmonyExportImportedSpecifierDependency')>;
  exportPresenceMode: number;
  allStarExports: HarmonyStarExportsList;
  get id(): void;
  getId(): void;
  setId(): void;
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
   * @returns {ExportMode} the export mode
   */
  getMode(moduleGraph: ModuleGraph, runtime: RuntimeSpec): ExportMode;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {RuntimeSpec} runtime the runtime
   * @param {ExportsInfo} exportsInfo exports info about the current module (optional)
   * @param {Module} importedModule the imported module (optional)
   * @returns {{exports?: Set<string>, checked?: Set<string>, ignoredExports: Set<string>, hidden?: Set<string>}} information
   */
  getStarReexports(
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec,
    exportsInfo?: ExportsInfo,
    importedModule?: Module,
  ): {
    exports?: Set<string>;
    checked?: Set<string>;
    ignoredExports: Set<string>;
    hidden?: Set<string>;
  };
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @returns {{ names: string[], namesSlice: number, dependencyIndices: number[], dependencyIndex: number } | undefined} exported names and their origin dependency
   */
  _discoverActiveExportsFromOtherStarExports(moduleGraph: ModuleGraph): {
    names: string[];
    namesSlice: number;
    dependencyIndices: number[];
    dependencyIndex: number;
  };
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
declare namespace HarmonyExportImportedSpecifierDependency {
  export {
    HarmonyExportImportedSpecifierDependencyTemplate as Template,
    HarmonyStarExportsList,
    ReplaceSource,
    ChunkGraph,
    ExportsSpec,
    ReferencedExport,
    TRANSITIVE,
    UpdateHashContext,
    DependencyTemplateContext,
    ExportsInfo,
    ExportInfo,
    Module,
    ModuleGraph,
    ModuleGraphConnection,
    ConnectionState,
    RuntimeTemplate,
    WebpackError,
    Assertions,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
    ExportModeType,
  };
}
import HarmonyImportDependency = require('./HarmonyImportDependency');
declare class HarmonyStarExportsList {
  /** @type {HarmonyExportImportedSpecifierDependency[]} */
  dependencies: HarmonyExportImportedSpecifierDependency[];
  /**
   * @param {HarmonyExportImportedSpecifierDependency} dep dependency
   * @returns {void}
   */
  push(dep: HarmonyExportImportedSpecifierDependency): void;
  slice(): import('./HarmonyExportImportedSpecifierDependency')[];
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write, setCircularReference }: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize({ read, setCircularReference }: ObjectDeserializerContext): void;
}
type ModuleGraph = import('../ModuleGraph');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
declare class ExportMode {
  /**
   * @param {ExportModeType} type type of the mode
   */
  constructor(type: ExportModeType);
  /** @type {ExportModeType} */
  type: ExportModeType;
  /** @type {NormalReexportItem[] | null} */
  items: NormalReexportItem[] | null;
  /** @type {string|null} */
  name: string | null;
  /** @type {ExportInfo | null} */
  partialNamespaceExportInfo: ExportInfo | null;
  /** @type {Set<string> | null} */
  ignored: Set<string> | null;
  /** @type {Set<string> | null} */
  hidden: Set<string> | null;
  /** @type {string | null} */
  userRequest: string | null;
  /** @type {number} */
  fakeType: number;
}
type ExportsInfo = import('../ExportsInfo');
type Module = import('../Module');
type WebpackError = import('../WebpackError');
type Assertions = import('../javascript/JavascriptParser').Assertions;
declare const HarmonyExportImportedSpecifierDependencyTemplate_base: {
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
declare class HarmonyExportImportedSpecifierDependencyTemplate extends HarmonyExportImportedSpecifierDependencyTemplate_base {
  /**
   * @param {InitFragment[]} initFragments target array for init fragments
   * @param {HarmonyExportImportedSpecifierDependency} dep dependency
   * @param {ExportMode} mode the export mode
   * @param {Module} module the current module
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {RuntimeSpec} runtime the runtime
   * @param {RuntimeTemplate} runtimeTemplate the runtime template
   * @param {Set<string>} runtimeRequirements runtime requirements
   * @returns {void}
   */
  _addExportFragments(
    initFragments: InitFragment<any>[],
    dep: HarmonyExportImportedSpecifierDependency,
    mode: ExportMode,
    module: Module,
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec,
    runtimeTemplate: RuntimeTemplate,
    runtimeRequirements: Set<string>,
  ): void;
  getReexportFragment(
    module: any,
    comment: any,
    key: any,
    name: any,
    valueKey: any,
    runtimeRequirements: any,
  ): HarmonyExportInitFragment;
  getReexportFakeNamespaceObjectFragments(
    module: any,
    key: any,
    name: any,
    fakeType: any,
    runtimeRequirements: any,
  ): InitFragment<any>[];
  getConditionalReexportStatement(
    module: any,
    key: any,
    name: any,
    valueKey: any,
    runtimeRequirements: any,
  ): string;
  getReturnValue(name: any, valueKey: any): any;
}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type ExportsSpec = import('../Dependency').ExportsSpec;
type ReferencedExport = import('../Dependency').ReferencedExport;
type TRANSITIVE = import('../Dependency').TRANSITIVE;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ExportInfo = import('../ExportsInfo').ExportInfo;
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type RuntimeTemplate = import('../RuntimeTemplate');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type ExportModeType =
  | 'missing'
  | 'unused'
  | 'empty-star'
  | 'reexport-dynamic-default'
  | 'reexport-named-default'
  | 'reexport-namespace-object'
  | 'reexport-fake-namespace-object'
  | 'reexport-undefined'
  | 'normal-reexport'
  | 'dynamic-reexport';
declare class NormalReexportItem {
  /**
   * @param {string} name export name
   * @param {string[]} ids reexported ids from other module
   * @param {ExportInfo} exportInfo export info from other module
   * @param {boolean} checked true, if it should be checked at runtime if this export exists
   * @param {boolean} hidden true, if it is hidden behind another active export in the same module
   */
  constructor(
    name: string,
    ids: string[],
    exportInfo: ExportInfo,
    checked: boolean,
    hidden: boolean,
  );
  name: string;
  ids: string[];
  exportInfo: import('../ExportsInfo').ExportInfo;
  checked: boolean;
  hidden: boolean;
}
import Dependency = require('../Dependency');
import InitFragment = require('../InitFragment');
import HarmonyExportInitFragment = require('./HarmonyExportInitFragment');
