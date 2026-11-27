export = Dependency;
/**
 * The kinds a dependency can be, each naming the class `is(kind)` narrows to.
 * @typedef {{
 * "module-dependency": ModuleDependency,
 * "esm-import": ESMImportDependency,
 * provided: ProvidedDependency,
 * "dynamic-import": ImportDependency,
 * "esm-reexport": ESMExportImportedSpecifierDependency,
 * "esm-export-specifier": ESMExportSpecifierDependency,
 * "esm-live-export": ESMLiveExportDependency,
 * "esm-side-effect-import": ESMImportSideEffectDependency,
 * "css-import": CssImportDependency,
 * entry: EntryDependency,
 * "context-element": ContextElementDependency,
 * "esm-bare-side-effect-import": ESMImportBareSideEffectDependency,
 * "esm-import-specifier": ESMImportSpecifierDependency,
 * "esm-evaluated-import-specifier": ESMEvaluatedImportSpecifierDependency,
 * "esm-compatibility": ESMCompatibilityDependency,
 * "commonjs-require": CommonJsRequireDependency | CommonJsFullRequireDependency,
 * "commonjs-export-require": CommonJsExportRequireDependency,
 * url: URLDependency,
 * "css-url": CssUrlDependency,
 * "html-source": HtmlSourceDependency,
 * "html-entry": HtmlEntryDependency,
 * worker: WorkerDependency,
 * "webassembly-import": WebAssemblyImportDependency,
 * "webassembly-export-imported": WebAssemblyExportImportedDependency,
 * "sharing-request": ConsumeSharedFallbackDependency | ProvideForSharedDependency,
 * "local-module": LocalModuleDependency,
 * "static-exports": StaticExportsDependency,
 * "loader-import": LoaderImportDependency,
 * "css-icss-import": CssIcssImportDependency,
 * "css-icss-export": CssIcssExportDependency,
 * }} DependencyKinds
 */
declare class Dependency {
    /**
     * Compares two dependencies by source location for sorting a module's
     * `dependencies`, without materializing the `loc` objects (`get loc` caches
     * its result, so comparing through it would retain a location object on every
     * sorted dependency). These dependencies always carry a real source position,
     * so only start (line, column) and the within-statement index are compared; a
     * dependency without an index sorts after one that has an index at the same
     * position.
     * @param {Dependency} a first dependency
     * @param {Dependency} b second dependency
     * @returns {-1 | 0 | 1} compare result
     */
    static compareLocations(a: Dependency, b: Dependency): -1 | 0 | 1;
    /** @type {Module | undefined} */
    _parentModule: Module | undefined;
    /** @type {DependenciesBlock | undefined} */
    _parentDependenciesBlock: DependenciesBlock | undefined;
    /** @type {number} */
    _parentDependenciesBlockIndex: number;
    /** @type {boolean | undefined} */
    optional: boolean | undefined;
    /** @type {number} */
    _locSL: number;
    /** @type {number} */
    _locSC: number;
    /** @type {number} */
    _locEL: number;
    /** @type {number} */
    _locEC: number;
    /** @type {undefined | number} */
    _locI: undefined | number;
    /** @type {undefined | string} */
    _locN: undefined | string;
    /** @type {undefined | DependencyLocation} */
    _loc: undefined | DependencyLocation;
    /**
     * Returns a display name for the type of dependency.
     * @returns {string} a display name for the type of dependency
     */
    get type(): string;
    /**
     * Returns a dependency category, typical categories are "commonjs", "amd", "esm".
     * @returns {string} a dependency category, typical categories are "commonjs", "amd", "esm"
     */
    get category(): string;
    /**
     * Returns the source type this dependency reads from the module it references:
     * `javascript` for anything going through the module wrapper, `asset-url` for a
     * bare url embedded into non-javascript output (css, html, a manifest).
     * @returns {SourceType} the source type read from the referenced module
     */
    get referencedSourceType(): Module.SourceType;
    set loc(loc: DependencyLocation);
    /**
     * Returns location.
     * @returns {DependencyLocation} location
     */
    get loc(): DependencyLocation;
    /**
     * Updates loc using the provided start line.
     * @param {number} startLine start line
     * @param {number} startColumn start column
     * @param {number} endLine end line
     * @param {number} endColumn end column
     */
    setLoc(startLine: number, startColumn: number, endLine: number, endColumn: number): void;
    /**
     * Updates loc from a source location plus an explicit index, without
     * materializing the `loc` object (keeps `get loc` lazy). Replaces the
     * `dep.loc = Object.create(loc); dep.loc.index = i` pattern, which both
     * allocated a copy and stored the index outside the serialized fields.
     * @param {DependencyLocation} loc source location (start/end/name read from it)
     * @param {number} index dependency index within the statement
     */
    setLocWithIndex(loc: DependencyLocation, index: number): void;
    /**
     * Returns a request context.
     * @returns {string | undefined} a request context
     */
    getContext(): string | undefined;
    /**
     * Returns whether this dependency is of the given kind; a subclass is every kind its parent is.
     * @template {keyof DependencyKinds} K
     * @param {K} kind a dependency kind
     * @returns {this is DependencyKinds[K]} true when this dependency is of that kind
     */
    is<K extends keyof DependencyKinds>(kind: K): this is DependencyKinds[K];
    /**
     * Returns an identifier to merge equal requests.
     * @returns {string | null} an identifier to merge equal requests
     */
    getResourceIdentifier(): string | null;
    /**
     * Could affect referencing module.
     * @returns {boolean | TRANSITIVE} true, when changes to the referenced module could affect the referencing module; TRANSITIVE, when changes to the referenced module could affect referencing modules of the referencing module
     */
    couldAffectReferencingModule(): boolean | symbol;
    /**
     * Returns the export name this dependency requests from its target module (lazy barrel optimization).
     * @returns {string | true | null} export name, true for all exports, null for none
     */
    get forwardId(): string | true | null;
    /**
     * Returns how this dependency may be deferred when its parent module is side-effect-free (lazy barrel optimization).
     * @returns {LazyRole | null} lazy classification, null when it must be processed eagerly
     */
    get lazyRole(): LazyRole | null;
    /**
     * Returns the export name for a `LAZY_LOCAL_EXPORT`/`LAZY_NAMED_REEXPORT` classification (lazy barrel optimization).
     * @returns {string | null} export name, null when not applicable
     */
    get lazyName(): string | null;
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
     * @returns {ReferencedExports} referenced exports
     */
    getReferencedExports(moduleGraph: ModuleGraph, runtime: RuntimeSpec): ReferencedExports;
    /**
     * Returns function to determine if the connection is active.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {null | false | GetConditionFn} function to determine if the connection is active
     */
    getCondition(moduleGraph: ModuleGraph): null | false | GetConditionFn;
    /**
     * Returns the exported names
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {ExportsSpec | undefined} export names
     */
    getExports(moduleGraph: ModuleGraph): ExportsSpec | undefined;
    /**
     * Returns warnings.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {WebpackError[] | null | undefined} warnings
     */
    getWarnings(moduleGraph: ModuleGraph): WebpackError[] | null | undefined;
    /**
     * Returns errors.
     * @param {ModuleGraph} moduleGraph module graph
     * @returns {WebpackError[] | null | undefined} errors
     */
    getErrors(moduleGraph: ModuleGraph): WebpackError[] | null | undefined;
    /**
     * Updates the hash with the data contributed by this instance.
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
     * Gets module evaluation side effects state.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {ConnectionState} how this dependency connects the module to referencing modules
     */
    getModuleEvaluationSideEffectsState(moduleGraph: ModuleGraph): ModuleGraphConnection.ConnectionState;
    /**
     * Creates an ignored module.
     * @param {string} context context directory
     * @returns {Module} ignored module
     */
    createIgnoredModule(context: string): Module;
    /**
     * Returns true if this dependency can be concatenated
     * @param {boolean} concatenateCommonJsModules whether optimization.concatenateModules.commonjs is enabled
     * @returns {boolean} true if this dependency can be concatenated
     */
    canConcatenate(concatenateCommonJsModules: boolean): boolean;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write }: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize({ read }: ObjectDeserializerContext): void;
    set module(value: void);
    get module(): void;
    get disconnect(): void;
}
declare namespace Dependency {
    export { NO_EXPORTS_REFERENCED, EXPORTS_OBJECT_REFERENCED, EXPORTS_OBJECT_REFERENCED_MANGLEABLE, isLowPriorityDependency, canConcatenate, TRANSITIVE, LAZY_LOCAL_EXPORT, LAZY_NAMED_REEXPORT, LAZY_STAR_REEXPORT, LAZY_REEXPORT_SIDE_EFFECT, LAZY_IMPORT_DECLARATION, ESM_CATEGORY, KINDS, UpdateHashContext, SourcePosition, RealDependencyLocation, SyntheticDependencyLocation, DependencyLocation, ExportInfoName, ExportSpec, ExportsSpecExcludeExports, ExportsSpec, ReferencedExport, RawReferencedExports, ReferencedExports, GetConditionFn, LazyRole, DependencyKinds };
}
import type Module from "../module/Module";
import type DependenciesBlock from "./DependenciesBlock";
import type ModuleGraph from "./ModuleGraph";
import type { RuntimeSpec } from "../util/runtime";
import type WebpackError from "../errors/WebpackError";
import type Hash from "../util/Hash";
import type ModuleGraphConnection from "./ModuleGraphConnection";
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
declare var NO_EXPORTS_REFERENCED: RawReferencedExports;
declare var EXPORTS_OBJECT_REFERENCED: RawReferencedExports;
declare var EXPORTS_OBJECT_REFERENCED_MANGLEABLE: RawReferencedExports;
/**
 * Returns true if the dependency is a low priority dependency.
 * @param {Dependency} dependency dep
 * @returns {boolean} true if the dependency is a low priority dependency
 */
declare function isLowPriorityDependency(dependency: Dependency): boolean;
/**
 * Returns true if the dependency can be concatenated (scope hoisting).
 * @param {Dependency} dependency dep
 * @param {boolean} concatenateCommonJsModules whether optimization.concatenateModules.commonjs is enabled
 * @returns {boolean} true if this dependency supports concatenation
 */
declare function canConcatenate(dependency: Dependency, concatenateCommonJsModules: boolean): boolean;
declare const TRANSITIVE: symbol;
/** @import ChunkGraph from "./ChunkGraph" */
/** @import ESMImportBareSideEffectDependency from "../dependencies/esm/ESMImportBareSideEffectDependency" */
/** @import ESMImportSpecifierDependency from "../dependencies/esm/ESMImportSpecifierDependency" */
/** @import ESMEvaluatedImportSpecifierDependency from "../dependencies/esm/ESMEvaluatedImportSpecifierDependency" */
/** @import ESMCompatibilityDependency from "../dependencies/esm/ESMCompatibilityDependency" */
/** @import CommonJsRequireDependency from "../dependencies/commonjs/CommonJsRequireDependency" */
/** @import CommonJsExportRequireDependency from "../dependencies/commonjs/CommonJsExportRequireDependency" */
/** @import CommonJsFullRequireDependency from "../dependencies/commonjs/CommonJsFullRequireDependency" */
/** @import URLDependency from "../dependencies/url/URLDependency" */
/** @import CssUrlDependency from "../dependencies/css/CssUrlDependency" */
/** @import HtmlSourceDependency from "../dependencies/html/HtmlSourceDependency" */
/** @import HtmlEntryDependency from "../dependencies/html/HtmlEntryDependency" */
/** @import WorkerDependency from "../dependencies/worker/WorkerDependency" */
/** @import WebAssemblyImportDependency from "../dependencies/wasm/WebAssemblyImportDependency" */
/** @import WebAssemblyExportImportedDependency from "../dependencies/wasm/WebAssemblyExportImportedDependency" */
/** @import ConsumeSharedFallbackDependency from "../sharing/ConsumeSharedFallbackDependency" */
/** @import ProvideForSharedDependency from "../sharing/ProvideForSharedDependency" */
/** @import ProvidedDependency from "../provide/ProvidedDependency" */
/** @import LocalModuleDependency from "../dependencies/amd/LocalModuleDependency" */
/** @import StaticExportsDependency from "../dependencies/core/StaticExportsDependency" */
/** @import LoaderImportDependency from "../loaders/LoaderImportDependency" */
/** @import CssIcssImportDependency from "../dependencies/css/CssIcssImportDependency" */
/** @import CssIcssExportDependency from "../dependencies/css/CssIcssExportDependency" */
/** @import ContextElementDependency from "../dependencies/context/ContextElementDependency" */
/** @import EntryDependency from "../entry/EntryDependency" */
/** @import CssImportDependency from "../dependencies/css/CssImportDependency" */
/** @import ESMImportDependency from "../dependencies/esm/ESMImportDependency" */
/** @import ImportDependency from "../dependencies/import/ImportDependency" */
/** @import ESMExportImportedSpecifierDependency from "../dependencies/esm/ESMExportImportedSpecifierDependency" */
/** @import ESMExportSpecifierDependency from "../dependencies/esm/ESMExportSpecifierDependency" */
/** @import ESMLiveExportDependency from "../dependencies/esm/ESMLiveExportDependency" */
/** @import ESMImportSideEffectDependency from "../dependencies/esm/ESMImportSideEffectDependency" */
/** @import DependenciesBlock from "./DependenciesBlock" */
/** @import Module, { SourceType } from "../module/Module" */
/** @import ModuleGraph from "./ModuleGraph" */
/**
 * @import ModuleGraphConnection, {
 * 	ConnectionState
 * } from "./ModuleGraphConnection"
 */
/** @import RuntimeTemplate from "../template/RuntimeTemplate" */
/** @import WebpackError from "../errors/WebpackError" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../serialization/ObjectMiddleware"
 */
/** @import Hash from "../util/Hash" */
/** @import { RuntimeSpec } from "../util/runtime" */
/** @import ModuleDependency from "../dependencies/core/ModuleDependency" */
/**
 * Defines the update hash context type used by this module.
 * @typedef {object} UpdateHashContext
 * @property {ChunkGraph} chunkGraph
 * @property {RuntimeSpec} runtime
 * @property {RuntimeTemplate=} runtimeTemplate
 */
/**
 * Defines the source position type used by this module.
 * @typedef {object} SourcePosition
 * @property {number} line
 * @property {number=} column
 */
/**
 * Defines the real dependency location type used by this module.
 * @typedef {object} RealDependencyLocation
 * @property {SourcePosition} start
 * @property {SourcePosition=} end
 * @property {number=} index
 */
/**
 * Defines the synthetic dependency location type used by this module.
 * @typedef {object} SyntheticDependencyLocation
 * @property {string} name
 * @property {number=} index
 */
/** @typedef {SyntheticDependencyLocation | RealDependencyLocation} DependencyLocation */
/** @typedef {string} ExportInfoName */
/**
 * Defines the export spec type used by this module.
 * @typedef {object} ExportSpec
 * @property {ExportInfoName} name the name of the export
 * @property {boolean=} canMangle can the export be renamed (defaults to true)
 * @property {boolean=} terminalBinding is the export a terminal binding that should be checked for export star conflicts
 * @property {boolean=} isPure calling this export has no observable side effects
 * @property {(string | ExportSpec)[]=} exports nested exports
 * @property {ModuleGraphConnection=} from when reexported: from which module
 * @property {string[] | null=} export when reexported: from which export
 * @property {number=} priority when reexported: with which priority
 * @property {boolean=} hidden export is not visible, because another export blends over it
 * @property {import("../optimize/InlineExports").InlinedValue=} inlined when set: the export binds to a small primitive constant eligible for inlining
 */
/** @typedef {Set<string>} ExportsSpecExcludeExports */
/**
 * Defines the exports spec type used by this module.
 * @typedef {object} ExportsSpec
 * @property {(string | ExportSpec)[] | true | null} exports exported names, true for unknown exports or null for no exports
 * @property {ExportsSpecExcludeExports=} excludeExports when exports = true, list of unaffected exports
 * @property {(Set<string> | null)=} hideExports list of maybe prior exposed, but now hidden exports
 * @property {ModuleGraphConnection=} from when reexported: from which module
 * @property {number=} priority when reexported: with which priority
 * @property {boolean=} canMangle can the export be renamed (defaults to true)
 * @property {boolean=} terminalBinding are the exports terminal bindings that should be checked for export star conflicts
 * @property {boolean=} isPure calling these exports has no observable side effects
 * @property {Module[]=} dependencies module on which the result depends on
 */
/**
 * Defines the referenced export type used by this module.
 * @typedef {object} ReferencedExport
 * @property {string[]} name name of the referenced export
 * @property {boolean=} canMangle when false, referenced export can not be mangled, defaults to true
 * @property {boolean=} canInline when false, the referenced export can not be substituted with an inlined literal at this site, defaults to true
 */
/** @typedef {string[][]} RawReferencedExports */
/** @typedef {(string[] | ReferencedExport)[]} ReferencedExports */
/** @typedef {(moduleGraphConnection: ModuleGraphConnection, runtime: RuntimeSpec) => ConnectionState} GetConditionFn */
/**
 * Lazy barrel classification of a dependency within a side-effect-free module.
 * `LAZY_LOCAL_EXPORT`: locally provided export name (`lazyName`), requesting it requires no dependency.
 * `LAZY_NAMED_REEXPORT`: named re-export (`lazyName`) deferred until the export name is requested.
 * `LAZY_STAR_REEXPORT`: star re-export, deferred until an unknown name or all names are requested.
 * `LAZY_REEXPORT_SIDE_EFFECT`: evaluation of the module an `export … from` names, deferred together with its re-exports.
 * `LAZY_IMPORT_DECLARATION`: import declaration, deferred while only re-exported names are requested.
 * @typedef {"local" | "id" | "*" | "@" | "import"} LazyRole
 */
declare const LAZY_LOCAL_EXPORT: "local";
declare const LAZY_NAMED_REEXPORT: "id";
declare const LAZY_STAR_REEXPORT: "*";
declare const LAZY_REEXPORT_SIDE_EFFECT: "@";
declare const LAZY_IMPORT_DECLARATION: "import";
/**
 * The category used by dependencies created from ECMAScript module syntax.
 * @type {"esm"}
 */
declare const ESM_CATEGORY: "esm";
declare var KINDS: Set<keyof DependencyKinds>;
/**
 * Defines the update hash context type used by this module.
 */
type UpdateHashContext = {
    chunkGraph: ChunkGraph;
    runtime: RuntimeSpec;
    runtimeTemplate?: RuntimeTemplate | undefined;
};
/**
 * Defines the source position type used by this module.
 */
type SourcePosition = {
    line: number;
    column?: number | undefined;
};
/**
 * Defines the real dependency location type used by this module.
 */
type RealDependencyLocation = {
    start: SourcePosition;
    end?: SourcePosition | undefined;
    index?: number | undefined;
};
/**
 * Defines the synthetic dependency location type used by this module.
 */
type SyntheticDependencyLocation = {
    name: string;
    index?: number | undefined;
};
type DependencyLocation = SyntheticDependencyLocation | RealDependencyLocation;
type ExportInfoName = string;
/**
 * Defines the export spec type used by this module.
 */
type ExportSpec = {
    /**
     * the name of the export
     */
    name: ExportInfoName;
    /**
     * can the export be renamed (defaults to true)
     */
    canMangle?: boolean | undefined;
    /**
     * is the export a terminal binding that should be checked for export star conflicts
     */
    terminalBinding?: boolean | undefined;
    /**
     * calling this export has no observable side effects
     */
    isPure?: boolean | undefined;
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
    /**
     * when set: the export binds to a small primitive constant eligible for inlining
     */
    inlined?: import("../optimize/InlineExports").InlinedValue | undefined;
};
type ExportsSpecExcludeExports = Set<string>;
/**
 * Defines the exports spec type used by this module.
 */
type ExportsSpec = {
    /**
     * exported names, true for unknown exports or null for no exports
     */
    exports: (string | ExportSpec)[] | true | null;
    /**
     * when exports = true, list of unaffected exports
     */
    excludeExports?: ExportsSpecExcludeExports | undefined;
    /**
     * list of maybe prior exposed, but now hidden exports
     */
    hideExports?: (Set<string> | null) | undefined;
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
     * calling these exports has no observable side effects
     */
    isPure?: boolean | undefined;
    /**
     * module on which the result depends on
     */
    dependencies?: Module[] | undefined;
};
/**
 * Defines the referenced export type used by this module.
 */
type ReferencedExport = {
    /**
     * name of the referenced export
     */
    name: string[];
    /**
     * when false, referenced export can not be mangled, defaults to true
     */
    canMangle?: boolean | undefined;
    /**
     * when false, the referenced export can not be substituted with an inlined literal at this site, defaults to true
     */
    canInline?: boolean | undefined;
};
type RawReferencedExports = string[][];
type ReferencedExports = (string[] | ReferencedExport)[];
type GetConditionFn = (moduleGraphConnection: ModuleGraphConnection, runtime: RuntimeSpec) => ModuleGraphConnection.ConnectionState;
/**
 * Lazy barrel classification of a dependency within a side-effect-free module.
 * `LAZY_LOCAL_EXPORT`: locally provided export name (`lazyName`), requesting it requires no dependency.
 * `LAZY_NAMED_REEXPORT`: named re-export (`lazyName`) deferred until the export name is requested.
 * `LAZY_STAR_REEXPORT`: star re-export, deferred until an unknown name or all names are requested.
 * `LAZY_REEXPORT_SIDE_EFFECT`: evaluation of the module an `export … from` names, deferred together with its re-exports.
 * `LAZY_IMPORT_DECLARATION`: import declaration, deferred while only re-exported names are requested.
 */
type LazyRole = "local" | "id" | "*" | "@" | "import";
/**
 * The kinds a dependency can be, each naming the class `is(kind)` narrows to.
 */
type DependencyKinds = {
    "module-dependency": ModuleDependency;
    "esm-import": ESMImportDependency;
    provided: ProvidedDependency;
    "dynamic-import": ImportDependency;
    "esm-reexport": ESMExportImportedSpecifierDependency;
    "esm-export-specifier": ESMExportSpecifierDependency;
    "esm-live-export": ESMLiveExportDependency;
    "esm-side-effect-import": ESMImportSideEffectDependency;
    "css-import": CssImportDependency;
    entry: EntryDependency;
    "context-element": ContextElementDependency;
    "esm-bare-side-effect-import": ESMImportBareSideEffectDependency;
    "esm-import-specifier": ESMImportSpecifierDependency;
    "esm-evaluated-import-specifier": ESMEvaluatedImportSpecifierDependency;
    "esm-compatibility": ESMCompatibilityDependency;
    "commonjs-require": CommonJsRequireDependency | CommonJsFullRequireDependency;
    "commonjs-export-require": CommonJsExportRequireDependency;
    url: URLDependency;
    "css-url": CssUrlDependency;
    "html-source": HtmlSourceDependency;
    "html-entry": HtmlEntryDependency;
    worker: WorkerDependency;
    "webassembly-import": WebAssemblyImportDependency;
    "webassembly-export-imported": WebAssemblyExportImportedDependency;
    "sharing-request": ConsumeSharedFallbackDependency | ProvideForSharedDependency;
    "local-module": LocalModuleDependency;
    "static-exports": StaticExportsDependency;
    "loader-import": LoaderImportDependency;
    "css-icss-import": CssIcssImportDependency;
    "css-icss-export": CssIcssExportDependency;
};
import type ChunkGraph from "./ChunkGraph";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type ModuleDependency from "../dependencies/core/ModuleDependency";
import type ESMImportDependency from "../dependencies/esm/ESMImportDependency";
import type ProvidedDependency from "../provide/ProvidedDependency";
import type ImportDependency from "../dependencies/import/ImportDependency";
import type ESMExportImportedSpecifierDependency from "../dependencies/esm/ESMExportImportedSpecifierDependency";
import type ESMExportSpecifierDependency from "../dependencies/esm/ESMExportSpecifierDependency";
import type ESMLiveExportDependency from "../dependencies/esm/ESMLiveExportDependency";
import type ESMImportSideEffectDependency from "../dependencies/esm/ESMImportSideEffectDependency";
import type CssImportDependency from "../dependencies/css/CssImportDependency";
import type EntryDependency from "../entry/EntryDependency";
import type ContextElementDependency from "../dependencies/context/ContextElementDependency";
import type ESMImportBareSideEffectDependency from "../dependencies/esm/ESMImportBareSideEffectDependency";
import type ESMImportSpecifierDependency from "../dependencies/esm/ESMImportSpecifierDependency";
import type ESMEvaluatedImportSpecifierDependency from "../dependencies/esm/ESMEvaluatedImportSpecifierDependency";
import type ESMCompatibilityDependency from "../dependencies/esm/ESMCompatibilityDependency";
import type CommonJsRequireDependency from "../dependencies/commonjs/CommonJsRequireDependency";
import type CommonJsFullRequireDependency from "../dependencies/commonjs/CommonJsFullRequireDependency";
import type CommonJsExportRequireDependency from "../dependencies/commonjs/CommonJsExportRequireDependency";
import type URLDependency from "../dependencies/url/URLDependency";
import type CssUrlDependency from "../dependencies/css/CssUrlDependency";
import type HtmlSourceDependency from "../dependencies/html/HtmlSourceDependency";
import type HtmlEntryDependency from "../dependencies/html/HtmlEntryDependency";
import type WorkerDependency from "../dependencies/worker/WorkerDependency";
import type WebAssemblyImportDependency from "../dependencies/wasm/WebAssemblyImportDependency";
import type WebAssemblyExportImportedDependency from "../dependencies/wasm/WebAssemblyExportImportedDependency";
import type ConsumeSharedFallbackDependency from "../sharing/ConsumeSharedFallbackDependency";
import type ProvideForSharedDependency from "../sharing/ProvideForSharedDependency";
import type LocalModuleDependency from "../dependencies/amd/LocalModuleDependency";
import type StaticExportsDependency from "../dependencies/core/StaticExportsDependency";
import type LoaderImportDependency from "../loaders/LoaderImportDependency";
import type CssIcssImportDependency from "../dependencies/css/CssIcssImportDependency";
import type CssIcssExportDependency from "../dependencies/css/CssIcssExportDependency";
