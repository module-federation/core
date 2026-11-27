export = ExternalModule;
/**
 * @typedef {ReturnType<typeof createCompilationHooks>} ExternalModuleHooks
 */
/**
 * Defines the build info properties specific to external modules.
 * @typedef {object} KnownExternalModuleBuildInfo
 * @property {boolean=} javascriptModule true when emitting an ESM external (`output.module`)
 */
/** @typedef {BuildInfo & KnownExternalModuleBuildInfo} ExternalModuleBuildInfo */
declare class ExternalModule extends Module {
    /**
     * Creates an instance of ExternalModule.
     * @param {ExternalModuleRequest} request request
     * @param {ExternalsType} type type
     * @param {string} userRequest user request
     * @param {DependencyMeta=} dependencyMeta dependency meta
     * @param {ExternalInterop=} interop how the external's exports interoperate with ES module imports
     * @param {boolean=} sideEffects whether importing the external has side effects (undefined = assume it has)
     */
    constructor(request: ExternalModuleRequest, type: ExternalsType, userRequest: string, dependencyMeta?: DependencyMeta | undefined, interop?: ExternalInterop | undefined, sideEffects?: boolean | undefined);
    /** @type {ExternalModuleRequest} */
    request: ExternalModuleRequest;
    /** @type {ExternalsType} */
    externalType: ExternalsType;
    /** @type {string} */
    userRequest: string;
    /** @type {DependencyMeta=} */
    dependencyMeta: DependencyMeta | undefined;
    /** @type {ExternalInterop | undefined} interop shape of the external's exports (undefined = importer-driven default) */
    interop: ExternalInterop | undefined;
    /** @type {boolean | undefined} declared side-effects state (undefined = assume side effects, webpack can't analyze an external) */
    sideEffects: boolean | undefined;
    /**
     * restore unsafe cache data
     * @param {UnsafeCacheData} unsafeCacheData data from getUnsafeCacheData
     * @param {NormalModuleFactory} normalModuleFactory the normal module factory handling the unsafe caching
     */
    restoreFromUnsafeCache(unsafeCacheData: Compilation.UnsafeCacheData, normalModuleFactory: NormalModuleFactory): void;
    /**
     * The request this external resolves to for its own type, with the record form
     * narrowed to its entry. An array is a module specifier plus a property path.
     * @returns {string | string[] | undefined} the resolved request
     */
    getResolvedRequest(): string | string[] | undefined;
    /**
     * Get request and external type.
     * @private
     * @returns {{ request: string | string[], externalType: ExternalsType }} the request and external type
     */
    private _getRequestAndExternalType;
    /**
     * Resolve the detailed external type from the raw external type.
     * e.g. resolve "module" or "import" from "module-import" type
     * @param {ExternalsType} externalType raw external type
     * @returns {ExternalsType} resolved external type
     */
    _resolveExternalType(externalType: ExternalsType): ExternalsType;
    /**
     * Returns the source data.
     * @private
     * @param {string | string[]} request request
     * @param {ExternalsType} externalType the external type
     * @param {RuntimeTemplate} runtimeTemplate the runtime template
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {RuntimeSpec} runtime the runtime
     * @param {DependencyMeta | undefined} dependencyMeta the dependency meta
     * @param {ConcatenationScope=} concatenationScope concatenationScope
     * @returns {SourceData} the source data
     */
    private _getSourceData;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace ExternalModule {
    export { getCompilationHooks, ModuleExternalInitFragment, getExternalModuleNodeCommonjsInitFragment, KINDS, ObjectDeserializerContext, ObjectSerializerContext, ImportDependencyMeta, CssImportDependencyMeta, AssetDependencyMeta, DependencyMeta, SourceData, Imported, ModuleAndSpecifiers, RequestRecord, ExternalModuleRequest, ExternalModuleHooks, KnownExternalModuleBuildInfo, ExternalModuleBuildInfo };
}
import Module = require("../module/Module");
import type { ExternalsType } from "../../declarations/WebpackOptions";
import type { ExternalItemInterop as ExternalInterop } from "../../declarations/WebpackOptions";
import type Compilation from "../Compilation";
import type NormalModuleFactory from "../module/NormalModuleFactory";
import type Hash from "../util/Hash";
import type { UpdateHashContext } from "../graph/Dependency";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * @type {SyncBailHook<[Chunk, Compilation], boolean>}
     * @since 5.106.0
     */
    chunkCondition: SyncBailHook<[Chunk, Compilation], boolean>;
};
/**
 * Represents ModuleExternalInitFragment.
 * @extends {InitFragment<GenerateContext>}
 */
declare class ModuleExternalInitFragment extends InitFragment<ChunkRenderContext> {
    /**
     * Creates an instance of ModuleExternalInitFragment.
     * @param {string} request import source
     * @param {Imported} imported the imported specifiers
     * @param {string=} ident recomputed ident
     * @param {ImportDependencyMeta=} dependencyMeta the dependency meta
     * @param {HashFunction=} hashFunction the hash function to use
     */
    constructor(request: string, imported: Imported, ident?: string | undefined, dependencyMeta?: ImportDependencyMeta | undefined, hashFunction?: HashFunction | undefined);
    /** @type {string} */
    _ident: string;
    /** @type {string} */
    _request: string;
    /** @type {ImportDependencyMeta | undefined} */
    _dependencyMeta: ImportDependencyMeta | undefined;
    /** @type {string} */
    _identifier: string;
    /** @type {Imported} */
    _imported: Imported;
    /**
     * Returns imported.
     * @returns {Imported} imported
     */
    getImported(): Imported;
    /**
     * Updates imported using the provided imported.
     * @param {Imported} imported imported
     */
    setImported(imported: Imported): void;
    getNamespaceIdentifier(): string;
    /**
     * Returns identifier.
     * @param {string} ident ident
     * @returns {string} identifier
     */
    buildIdentifier(ident: string): string;
    /**
     * Returns normalized imported.
     * @param {Imported} imported imported
     * @returns {Imported} normalized imported
     */
    buildImported(imported: Imported): Imported;
}
/**
 * Gets external module node commonjs init fragment.
 * @param {RuntimeTemplate} runtimeTemplate the runtime template
 * @param {boolean=} universal target may also run outside node (e.g. `["node", "web"]`)
 * @returns {InitFragment<ChunkRenderContext>} code
 */
declare function getExternalModuleNodeCommonjsInitFragment(runtimeTemplate: RuntimeTemplate, universal?: boolean | undefined): InitFragment<ChunkRenderContext>;
declare var KINDS: Set<keyof Module.ModuleKinds>;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[ExternalModuleRequest, ExternalsType, string, DependencyMeta | undefined, ExternalInterop | undefined, boolean | undefined]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[ExternalModuleRequest, ExternalsType, string, DependencyMeta | undefined, ExternalInterop | undefined, boolean | undefined]>;
type ImportDependencyMeta = {
    attributes?: ImportAttributes;
    phase?: ImportPhaseType;
    externalType: "import" | "module" | undefined;
};
type CssImportDependencyMeta = {
    layer?: string;
    supports?: string;
    media?: string;
};
type AssetDependencyMeta = {
    sourceType: "asset-url" | "css-url";
};
type DependencyMeta = ImportDependencyMeta | CssImportDependencyMeta | AssetDependencyMeta;
/**
 * Defines the source data type used by this module.
 */
type SourceData = {
    iife?: boolean | undefined;
    init?: string | undefined;
    expression: string;
    chunkInitFragments?: InitFragment<ChunkRenderContext>[] | undefined;
    runtimeRequirements?: Module.ReadOnlyRuntimeRequirements | undefined;
    specifiers?: [string, string][] | undefined;
    /**
     * native reexport source and attributes
     */
    externalReexport?: string | undefined;
};
type Imported = true | [string, string][];
type ModuleAndSpecifiers = string | string[];
type RequestRecord = Record<string, string | string[]>;
type ExternalModuleRequest = string | string[] | RequestRecord;
type ExternalModuleHooks = ReturnType<typeof createCompilationHooks>;
/**
 * Defines the build info properties specific to external modules.
 */
type KnownExternalModuleBuildInfo = {
    /**
     * true when emitting an ESM external (`output.module`)
     */
    javascriptModule?: boolean | undefined;
};
type ExternalModuleBuildInfo = Module.BuildInfo & KnownExternalModuleBuildInfo;
import { SyncBailHook } from "tapable";
import type Chunk from "../graph/Chunk";
import type { ChunkRenderContext } from "../javascript/JavascriptModulesPlugin";
import InitFragment = require("../template/InitFragment");
import type { HashFunction } from "../../declarations/WebpackOptions";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type { ImportAttributes } from "../javascript/JavascriptParser";
import type { ImportPhaseType } from "../dependencies/core/ImportPhase";
/** @typedef {Record<string, string | string[]>} RequestRecord */
/** @typedef {string | string[] | RequestRecord} ExternalModuleRequest */
declare function createCompilationHooks(): {
    /**
     * @type {SyncBailHook<[Chunk, Compilation], boolean>}
     * @since 5.106.0
     */
    chunkCondition: SyncBailHook<[Chunk, Compilation], boolean>;
};
