export class Dependency {
  /** @type {Module | undefined} */
  _parentModule: Module | undefined;
  /** @type {DependenciesBlock | undefined} */
  _parentDependenciesBlock: DependenciesBlock | undefined;
  /** @type {number} */
  _parentDependenciesBlockIndex: number;
  /** @type {boolean} */
  weak: boolean;
  /** @type {boolean} */
  optional: boolean;
  _locSL: number;
  _locSC: number;
  _locEL: number;
  _locEC: number;
  _locI: any;
  _locN: any;
  _loc:
    | DependencyLocation
    | (SyntheticDependencyLocation & RealDependencyLocation)
    | undefined;
  /**
   * @returns {string} a display name for the type of dependency
   */
  get type(): string;
  /**
   * @returns {string} a dependency category, typical categories are "commonjs", "amd", "esm"
   */
  get category(): string;
  set loc(arg: DependencyLocation);
  /**
   * @returns {DependencyLocation} location
   */
  get loc(): DependencyLocation;
  /**
   * @param {number} startLine start line
   * @param {number} startColumn start column
   * @param {number} endLine end line
   * @param {number} endColumn end column
   */
  setLoc(
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number,
  ): void;
  /**
   * @returns {string | undefined} a request context
   */
  getContext(): string | undefined;
  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  getResourceIdentifier(): string | null;
  /**
   * @returns {boolean | TRANSITIVE} true, when changes to the referenced module could affect the referencing module; TRANSITIVE, when changes to the referenced module could affect referencing modules of the referencing module
   */
  couldAffectReferencingModule(): boolean | typeof TRANSITIVE;
  /**
   * Returns the referenced module and export
   * @deprecated
   * @param {ModuleGraph} moduleGraph module graph
   * @returns {never} throws error
   */
  getReference(moduleGraph: ModuleGraph): never;
  /**
   * Returns list of exports referenced by this dependency
   * @param {ModuleGraph} moduleGraph module graph
   * @param {RuntimeSpec} runtime the runtime for which the module is analysed
   * @returns {(string[] | ReferencedExport)[]} referenced exports
   */
  getReferencedExports(
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec,
  ): (string[] | ReferencedExport)[];
  /**
   * @param {ModuleGraph} moduleGraph module graph
   * @returns {null | false | function(ModuleGraphConnection, RuntimeSpec): ConnectionState} function to determine if the connection is active
   */
  getCondition(
    moduleGraph: ModuleGraph,
  ):
    | false
    | ((arg0: ModuleGraphConnection, arg1: RuntimeSpec) => ConnectionState)
    | null;
  /**
   * Returns the exported names
   * @param {ModuleGraph} moduleGraph module graph
   * @returns {ExportsSpec | undefined} export names
   */
  getExports(moduleGraph: ModuleGraph): ExportsSpec | undefined;
  /**
   * Returns warnings
   * @param {ModuleGraph} moduleGraph module graph
   * @returns {WebpackError[] | null | undefined} warnings
   */
  getWarnings(moduleGraph: ModuleGraph): WebpackError[] | null | undefined;
  /**
   * Returns errors
   * @param {ModuleGraph} moduleGraph module graph
   * @returns {WebpackError[] | null | undefined} errors
   */
  getErrors(moduleGraph: ModuleGraph): WebpackError[] | null | undefined;
  /**
   * Update the hash
   * @param {Hash} hash hash to be updated
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
  /**
   * implement this method to allow the occurrence order plugin to count correctly
   * @returns {number} count how often the id is used in this dependency
   */
  getNumberOfIdOccurrences(): number;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @returns {ConnectionState} how this dependency connects the module to referencing modules
   */
  getModuleEvaluationSideEffectsState(
    moduleGraph: ModuleGraph,
  ): ConnectionState;
  /**
   * @param {string} context context directory
   * @returns {Module | null} a module
   */
  createIgnoredModule(context: string): Module | null;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write }: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize({ read }: ObjectDeserializerContext): void;
  set module(arg: any);
  get module(): any;
  get disconnect(): any;
}
declare namespace Dependency {
  export {
    NO_EXPORTS_REFERENCED,
    EXPORTS_OBJECT_REFERENCED,
    TRANSITIVE,
    Source,
    ChunkGraph,
    DependenciesBlock,
    DependencyTemplates,
    Module,
    ModuleGraph,
    ModuleGraphConnection,
    ConnectionState,
    RuntimeTemplate,
    WebpackError,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
    UpdateHashContext,
    SourcePosition,
    RealDependencyLocation,
    SyntheticDependencyLocation,
    DependencyLocation,
    ExportSpec,
    ExportsSpec,
    ReferencedExport,
  };
}
type Module = import('./Module');
type DependenciesBlock = import('./DependenciesBlock');
type DependencyLocation = SyntheticDependencyLocation | RealDependencyLocation;
type SyntheticDependencyLocation = {
  name: string;
  index?: number | undefined;
};
type RealDependencyLocation = {
  start: SourcePosition;
  end?: SourcePosition | undefined;
  index?: number | undefined;
};

declare const TRANSITIVE: unique symbol;
type ModuleGraph = import('./ModuleGraph');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type ReferencedExport = {
  /**
   * name of the referenced export
   */
  name: string[];
  /**
   * when false, referenced export can not be mangled, defaults to true
   */
  canMangle?: boolean | undefined;
};
type ModuleGraphConnection = import('./ModuleGraphConnection');
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
type ExportsSpec = {
  /**
   * exported names, true for unknown exports or null for no exports
   */
  exports: (string | ExportSpec)[] | true | null;
  /**
   * when exports = true, list of unaffected exports
   */
  excludeExports?: Set<string> | undefined;
  /**
   * list of maybe prior exposed, but now hidden exports
   */
  hideExports?: Set<string> | undefined;
  /**
   * when reexported: from which module
   */
  from?: ModuleGraphConnection | undefined;
  /**
   * when reexported: with which priority
   */
  priority?: number | undefined;
  /**
   * can the export be renamed (defaults to true)
   */
  canMangle?: boolean | undefined;
  /**
   * are the exports terminal bindings that should be checked for export star conflicts
   */
  terminalBinding?: boolean | undefined;
  /**
   * module on which the result depends on
   */
  dependencies?: Module[] | undefined;
};
type WebpackError = import('./WebpackError');
type Hash = import('./util/Hash');
type UpdateHashContext = {
  chunkGraph: ChunkGraph;
  runtime: RuntimeSpec;
  runtimeTemplate?: RuntimeTemplate | undefined;
};
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
declare const NO_EXPORTS_REFERENCED: string[][];
declare const EXPORTS_OBJECT_REFERENCED: string[][];
type Source = import('webpack-sources').Source;
type ChunkGraph = import('./ChunkGraph');
type DependencyTemplates = import('./DependencyTemplates');
type RuntimeTemplate = import('./RuntimeTemplate');
type SourcePosition = {
  line: number;
  column?: number | undefined;
};
type ExportSpec = {
  /**
   * the name of the export
   */
  name: string;
  /**
   * can the export be renamed (defaults to true)
   */
  canMangle?: boolean | undefined;
  /**
   * is the export a terminal binding that should be checked for export star conflicts
   */
  terminalBinding?: boolean | undefined;
  /**
   * nested exports
   */
  exports?: (string | ExportSpec)[] | undefined;
  /**
   * when reexported: from which module
   */
  from?: ModuleGraphConnection | undefined;
  /**
   * when reexported: from which export
   */
  export?: (string[] | null) | undefined;
  /**
   * when reexported: with which priority
   */
  priority?: number | undefined;
  /**
   * export is not visible, because another export blends over it
   */
  hidden?: boolean | undefined;
};
