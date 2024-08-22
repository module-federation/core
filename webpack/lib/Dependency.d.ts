export = Dependency;
declare class Dependency {
  constructor();
  weak: boolean;
  optional: boolean;
  get type(): string;
  get category(): string;
  loc: DependencyLocation;
  setLoc(
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number,
  ): void;
  getContext(): undefined | string;
  getResourceIdentifier(): null | string;
  couldAffectReferencingModule(): boolean | typeof TRANSITIVE;

  /**
   * Returns the referenced module and export
   */
  getReference(moduleGraph: ModuleGraph): never;

  /**
   * Returns list of exports referenced by this dependency
   */
  getReferencedExports(
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec,
  ): (string[] | ReferencedExport)[];
  getCondition(
    moduleGraph: ModuleGraph,
  ):
    | null
    | false
    | ((arg0: ModuleGraphConnection, arg1: RuntimeSpec) => ConnectionState);

  /**
   * Returns the exported names
   */
  getExports(moduleGraph: ModuleGraph): undefined | ExportsSpec;

  /**
   * Returns warnings
   */
  getWarnings(moduleGraph: ModuleGraph): undefined | null | WebpackError[];

  /**
   * Returns errors
   */
  getErrors(moduleGraph: ModuleGraph): undefined | null | WebpackError[];

  /**
   * Update the hash
   */
  updateHash(hash: Hash, context: UpdateHashContextDependency): void;

  /**
   * implement this method to allow the occurrence order plugin to count correctly
   */
  getNumberOfIdOccurrences(): number;
  getModuleEvaluationSideEffectsState(
    moduleGraph: ModuleGraph,
  ): ConnectionState;
  createIgnoredModule(context: string): null | Module;
  serialize(__0: ObjectSerializerContext): void;
  deserialize(__0: ObjectDeserializerContext): void;
  module: any;
  get disconnect(): any;
  static NO_EXPORTS_REFERENCED: string[][];
  static EXPORTS_OBJECT_REFERENCED: string[][];
  static TRANSITIVE: typeof TRANSITIVE;
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
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./DependenciesBlock")} DependenciesBlock */
/** @typedef {import("./DependencyTemplates")} DependencyTemplates */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
/** @typedef {import("./ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("./ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("./WebpackError")} WebpackError */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {import("./util/runtime").RuntimeSpec} RuntimeSpec */
/**
 * @typedef {Object} UpdateHashContext
 * @property {ChunkGraph} chunkGraph
 * @property {RuntimeSpec} runtime
 * @property {RuntimeTemplate=} runtimeTemplate
 */
/**
 * @typedef {Object} SourcePosition
 * @property {number} line
 * @property {number=} column
 */
/**
 * @typedef {Object} RealDependencyLocation
 * @property {SourcePosition} start
 * @property {SourcePosition=} end
 * @property {number=} index
 */
/**
 * @typedef {Object} SyntheticDependencyLocation
 * @property {string} name
 * @property {number=} index
 */
/** @typedef {SyntheticDependencyLocation|RealDependencyLocation} DependencyLocation */
/**
 * @typedef {Object} ExportSpec
 * @property {string} name the name of the export
 * @property {boolean=} canMangle can the export be renamed (defaults to true)
 * @property {boolean=} terminalBinding is the export a terminal binding that should be checked for export star conflicts
 * @property {(string | ExportSpec)[]=} exports nested exports
 * @property {ModuleGraphConnection=} from when reexported: from which module
 * @property {string[] | null=} export when reexported: from which export
 * @property {number=} priority when reexported: with which priority
 * @property {boolean=} hidden export is not visible, because another export blends over it
 */
/**
 * @typedef {Object} ExportsSpec
 * @property {(string | ExportSpec)[] | true | null} exports exported names, true for unknown exports or null for no exports
 * @property {Set<string>=} excludeExports when exports = true, list of unaffected exports
 * @property {Set<string>=} hideExports list of maybe prior exposed, but now hidden exports
 * @property {ModuleGraphConnection=} from when reexported: from which module
 * @property {number=} priority when reexported: with which priority
 * @property {boolean=} canMangle can the export be renamed (defaults to true)
 * @property {boolean=} terminalBinding are the exports terminal bindings that should be checked for export star conflicts
 * @property {Module[]=} dependencies module on which the result depends on
 */
/**
 * @typedef {Object} ReferencedExport
 * @property {string[]} name name of the referenced export
 * @property {boolean=} canMangle when false, referenced export can not be mangled, defaults to true
 */
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
  canMangle?: boolean;
};
type ModuleGraphConnection = import('./ModuleGraphConnection');
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
type ExportsSpec = {
  /**
   * exported names, true for unknown exports or null for no exports
   */
  exports: null | true | (string | ExportSpec)[];

  /**
   * when exports = true, list of unaffected exports
   */
  excludeExports?: Set<string>;

  /**
   * list of maybe prior exposed, but now hidden exports
   */
  hideExports?: Set<string>;

  /**
   * when reexported: from which module
   */
  from?: ModuleGraphConnection;

  /**
   * when reexported: with which priority
   */
  priority?: number;

  /**
   * can the export be renamed (defaults to true)
   */
  canMangle?: boolean;

  /**
   * are the exports terminal bindings that should be checked for export star conflicts
   */
  terminalBinding?: boolean;

  /**
   * module on which the result depends on
   */
  dependencies?: Module[];
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
declare var NO_EXPORTS_REFERENCED: string[][];
declare var EXPORTS_OBJECT_REFERENCED: string[][];
type Source = any;
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
