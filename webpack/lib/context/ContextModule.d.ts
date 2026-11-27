export = ContextModule;
/** @import { Source } from "webpack-sources" */
/** @import { ResolveOptions } from "../../declarations/WebpackOptions" */
/**
 * @import {
 * 	WebpackOptionsNormalizedWithDefaults as WebpackOptions
 * } from "../config/defaults"
 */
/** @import Chunk, { ChunkId, ChunkName } from "../graph/Chunk" */
/** @import ChunkGraph, { ModuleId } from "../graph/ChunkGraph" */
/** @import { RawChunkGroupOptions } from "../graph/ChunkGroup" */
/** @import Compilation, { FileSystemDependencies } from "../Compilation" */
/** @import Dependency, { RawReferencedExports } from "../graph/Dependency" */
/** @import { Snapshot } from "../fs/FileSystemInfo" */
/**
 * @import {
 * 	BuildCallback,
 * 	BuildInfo,
 * 	BuildMeta,
 * 	CodeGenerationContext,
 * 	CodeGenerationResult,
 * 	LibIdentOptions,
 * 	LibIdent,
 * 	NeedBuildCallback,
 * 	NeedBuildContext,
 * 	RuntimeRequirements,
 * 	Sources,
 * 	SourceTypes,
 * 	ModuleKinds
 * } from "../module/Module"
 */
/** @import RequestShortener from "../util/RequestShortener" */
/** @import { ResolverWithOptions } from "../resolve/ResolverFactory" */
/** @import RuntimeTemplate from "../template/RuntimeTemplate" */
/** @import ContextElementDependency from "../dependencies/context/ContextElementDependency" */
/** @import { ImportAttributes } from "../javascript/JavascriptParser" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, boolean]>} ObjectSerializerContext */
/** @import { InputFileSystem } from "../fs/fs" */
/** @import { ImportPhaseType } from "../dependencies/core/ImportPhase" */
/** @typedef {"sync" | "eager" | "weak" | "async-weak" | "lazy" | "lazy-once"} ContextMode Context mode */
/**
 * @typedef {object} ContextOptions
 * @property {ContextMode} mode
 * @property {boolean} recursive
 * @property {RegExp | false | null} regExp
 * @property {"strict" | boolean=} namespaceObject
 * @property {string=} addon
 * @property {ChunkName=} chunkName
 * @property {RegExp | null=} include
 * @property {RegExp | null=} exclude
 * @property {RawChunkGroupOptions=} groupOptions
 * @property {string=} typePrefix
 * @property {string=} category
 * @property {RawReferencedExports | null=} referencedExports exports referenced from modules (won't be mangled)
 * @property {string | null=} layer
 * @property {ImportAttributes=} attributes
 * @property {ImportPhaseType=} phase
 * @property {string[]=} patterns glob patterns for import.meta.glob
 * @property {string=} requestContext importer context for import.meta.glob
 * @property {string=} importName import selection for import.meta.glob
 * @property {boolean=} exhaustive exhaustive mode for import.meta.glob
 * @property {boolean=} caseSensitive case-sensitive matching for import.meta.glob
 */
/**
 * @typedef {object} ContextModuleOptionsExtras
 * @property {string=} request the request of the context as written by the user, before it was resolved
 * @property {false | string | string[]} resource
 * @property {string=} resourceQuery
 * @property {string=} resourceFragment
 * @property {ResolveOptions=} resolveOptions
 */
/** @typedef {ContextOptions & ContextModuleOptionsExtras} ContextModuleOptions */
/**
 * @callback ResolveDependenciesCallback
 * @param {Error | null} err
 * @param {ContextElementDependency[]=} dependencies
 * @returns {void}
 */
/**
 * @callback ResolveDependencies
 * @param {InputFileSystem} fs
 * @param {ContextModuleOptions} options
 * @param {ResolveDependenciesCallback} callback
 */
/** @typedef {1 | 3 | 7 | 9} FakeMapType */
/** @typedef {Record<ModuleId, FakeMapType>} FakeMap */
/** @typedef {Record<string, ModuleId>} UserRequestMap */
/** @typedef {Record<ModuleId, ModuleId[]>} UserRequestsMap */
/**
 * Defines the build info properties specific to context modules.
 * @typedef {object} KnownContextModuleBuildInfo
 * @property {(InstanceType<Snapshot> | null)=} snapshot
 */
/** @typedef {BuildInfo & KnownContextModuleBuildInfo} ContextModuleBuildInfo */
declare class ContextModule extends Module {
    /**
     * @param {ResolveDependencies} resolveDependencies function to get dependencies in this context
     * @param {ContextModuleOptions} options options object
     */
    constructor(resolveDependencies: ResolveDependencies, options: ContextModuleOptions);
    /** @type {ContextModuleOptions} */
    options: ContextModuleOptions;
    /** @type {ResolveDependencies | undefined} */
    resolveDependencies: ResolveDependencies | undefined;
    /** @type {string} */
    _identifier: string;
    /** @type {boolean} */
    _forceBuild: boolean;
    /**
     * @private
     * @param {RegExp} regexString RegExp as a string
     * @param {boolean=} stripSlash do we need to strip a slsh
     * @returns {string} pretty RegExp
     */
    private _prettyRegExp;
    _createIdentifier(): string;
    /**
     * @param {Dependency[]} dependencies all dependencies
     * @param {ChunkGraph} chunkGraph chunk graph
     * @returns {UserRequestMap} map with user requests
     */
    getUserRequestMap(dependencies: Dependency[], chunkGraph: ChunkGraph): UserRequestMap;
    /**
     * @param {Dependency[]} dependencies all dependencies
     * @param {ChunkGraph} chunkGraph chunk graph
     * @returns {FakeMap | FakeMapType} fake map
     */
    getFakeMap(dependencies: Dependency[], chunkGraph: ChunkGraph): FakeMap | FakeMapType;
    /**
     * @param {FakeMap | FakeMapType} fakeMap fake map
     * @param {RuntimeTemplate=} runtimeTemplate the runtime template
     * @returns {string} fake map init statement
     */
    getFakeMapInitStatement(fakeMap: FakeMap | FakeMapType, runtimeTemplate?: RuntimeTemplate | undefined): string;
    /**
     * @param {Dependency[]} dependencies all dependencies
     * @param {ChunkGraph} chunkGraph chunk graph
     * @returns {UserRequestsMap} map with user requests
     */
    getModuleDeferredAsyncDepsMap(dependencies: Dependency[], chunkGraph: ChunkGraph): UserRequestsMap;
    /**
     * @param {false | UserRequestsMap} asyncDepsMap fake map
     * @param {RuntimeTemplate=} runtimeTemplate the runtime template
     * @returns {string} async deps map init statement
     */
    getModuleDeferredAsyncDepsMapInitStatement(asyncDepsMap: false | UserRequestsMap, runtimeTemplate?: RuntimeTemplate | undefined): string;
    /**
     * @param {FakeMapType} type type
     * @param {boolean=} asyncModule is async module
     * @returns {string} return result
     */
    getReturn(type: FakeMapType, asyncModule?: boolean | undefined): string;
    /**
     * @param {FakeMap | FakeMapType} fakeMap fake map
     * @param {boolean=} asyncModule is async module
     * @param {string=} asyncDeps async deps for deferred module
     * @param {string=} fakeMapDataExpression fake map data expression
     * @returns {string} module object source
     */
    getReturnModuleObjectSource(fakeMap: FakeMap | FakeMapType, asyncModule?: boolean | undefined, asyncDeps?: string | undefined, fakeMapDataExpression?: string | undefined): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {RuntimeTemplate=} runtimeTemplate the runtime template
     * @returns {string} source code
     */
    getSyncSource(dependencies: Dependency[], id: ChunkGraph.ModuleId, chunkGraph: ChunkGraph, runtimeTemplate?: RuntimeTemplate | undefined): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {RuntimeTemplate=} runtimeTemplate the runtime template
     * @returns {string} source code
     */
    getWeakSyncSource(dependencies: Dependency[], id: ChunkGraph.ModuleId, chunkGraph: ChunkGraph, runtimeTemplate?: RuntimeTemplate | undefined): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {ImportPhaseType} phase import phase
     * @param {object} context context
     * @param {ChunkGraph} context.chunkGraph the chunk graph
     * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
     * @returns {string} source code
     */
    getAsyncWeakSource(dependencies: Dependency[], id: ChunkGraph.ModuleId, phase: ImportPhaseType, { chunkGraph, runtimeTemplate }: {
        chunkGraph: ChunkGraph;
        runtimeTemplate: RuntimeTemplate;
    }): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {ImportPhaseType} phase import phase
     * @param {object} context context
     * @param {ChunkGraph} context.chunkGraph the chunk graph
     * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
     * @returns {string} source code
     */
    getEagerSource(dependencies: Dependency[], id: ChunkGraph.ModuleId, phase: ImportPhaseType, { chunkGraph, runtimeTemplate }: {
        chunkGraph: ChunkGraph;
        runtimeTemplate: RuntimeTemplate;
    }): string;
    /**
     * @param {AsyncDependenciesBlock} block block
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {ImportPhaseType} phase import phase
     * @param {object} options options object
     * @param {RuntimeTemplate} options.runtimeTemplate the runtime template
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {RuntimeRequirements} options.runtimeRequirements runtime requirements
     * @returns {string} source code
     */
    getLazyOnceSource(block: AsyncDependenciesBlock, dependencies: Dependency[], id: ChunkGraph.ModuleId, phase: ImportPhaseType, { runtimeTemplate, chunkGraph, runtimeRequirements }: {
        runtimeTemplate: RuntimeTemplate;
        chunkGraph: ChunkGraph;
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * @param {AsyncDependenciesBlock[]} blocks blocks
     * @param {ModuleId} id module id
     * @param {ImportPhaseType} phase import phase
     * @param {object} context context
     * @param {ChunkGraph} context.chunkGraph the chunk graph
     * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
     * @param {RuntimeRequirements} context.runtimeRequirements runtime requirements
     * @returns {string} source code
     */
    getLazySource(blocks: AsyncDependenciesBlock[], id: ChunkGraph.ModuleId, phase: ImportPhaseType, { chunkGraph, runtimeTemplate, runtimeRequirements }: {
        chunkGraph: ChunkGraph;
        runtimeTemplate: RuntimeTemplate;
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * @param {ModuleId} id module id
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @returns {string} source for empty async context
     */
    getSourceForEmptyContext(id: ChunkGraph.ModuleId, runtimeTemplate: RuntimeTemplate): string;
    /**
     * @param {ModuleId} id module id
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @returns {string} source for empty async context
     */
    getSourceForEmptyAsyncContext(id: ChunkGraph.ModuleId, runtimeTemplate: RuntimeTemplate): string;
    /**
     * @returns {string | undefined} import property access
     */
    getImportPropertyAccess(): string | undefined;
    /**
     * @param {number} index index
     * @param {string} userRequest user request
     * @param {string} value value expression
     * @param {string[]} entries entries
     * @returns {void}
     */
    appendGlobMapEntry(index: number, userRequest: string, value: string, entries: string[]): void;
    /**
     * @param {string} entries entries
     * @returns {string} object export source
     */
    getGlobObjectExportSource(entries: string): string;
    /**
     * @returns {string} empty object export source
     */
    getEmptyObjectExportSource(): string;
    /**
     * @param {AsyncDependenciesBlock[]} blocks blocks
     * @param {ImportPhaseType} phase import phase
     * @param {object} context context
     * @param {RuntimeTemplate} context.runtimeTemplate runtime template
     * @param {ChunkGraph} context.chunkGraph chunk graph
     * @param {RuntimeRequirements=} context.runtimeRequirements runtime requirements
     * @returns {string} glob lazy source
     */
    getGlobLazySource(blocks: AsyncDependenciesBlock[], phase: ImportPhaseType, { runtimeTemplate, chunkGraph, runtimeRequirements }: {
        runtimeTemplate: RuntimeTemplate;
        chunkGraph: ChunkGraph;
        runtimeRequirements?: Module.RuntimeRequirements | undefined;
    }): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ChunkGraph} chunkGraph chunk graph
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @returns {string} glob sync source
     */
    getGlobSyncSource(dependencies: Dependency[], chunkGraph: ChunkGraph, runtimeTemplate: RuntimeTemplate): string;
    /**
     * @param {string} asyncMode module mode
     * @param {ImportPhaseType} phase import phase
     * @param {CodeGenerationContext} context context info
     * @returns {string} the source code
     */
    getGlobSourceString(asyncMode: string, phase: ImportPhaseType, context: Module.CodeGenerationContext): string;
    /**
     * @param {string} asyncMode module mode
     * @param {ImportPhaseType} phase import phase
     * @param {CodeGenerationContext & { runtimeRequirements: RuntimeRequirements }} context context info
     * @returns {string} the source code
     */
    getSourceString(asyncMode: string, phase: ImportPhaseType, context: Module.CodeGenerationContext & {
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * @param {string} asyncMode module mode
     * @param {ImportPhaseType} phase import phase
     * @param {CodeGenerationContext & { runtimeRequirements: RuntimeRequirements }} context context info
     * @returns {string} the source code
     */
    getContextSourceString(asyncMode: string, phase: ImportPhaseType, context: Module.CodeGenerationContext & {
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * @param {string} sourceString source content
     * @param {Compilation=} compilation the compilation
     * @returns {Source} generated source
     */
    getSource(sourceString: string, compilation?: Compilation | undefined): Source;
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
declare namespace ContextModule {
    export { KINDS, ObjectDeserializerContext, ObjectSerializerContext, ContextMode, ContextOptions, ContextModuleOptionsExtras, ContextModuleOptions, ResolveDependenciesCallback, ResolveDependencies, FakeMapType, FakeMap, UserRequestMap, UserRequestsMap, KnownContextModuleBuildInfo, ContextModuleBuildInfo };
}
import Module = require("../module/Module");
import type Dependency from "../graph/Dependency";
import type ChunkGraph from "../graph/ChunkGraph";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type { ImportPhaseType } from "../dependencies/core/ImportPhase";
import AsyncDependenciesBlock = require("../graph/AsyncDependenciesBlock");
import type Compilation from "../Compilation";
import type { Source } from "webpack-sources";
declare var KINDS: Set<keyof Module.ModuleKinds>;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, boolean]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, boolean]>;
/**
 * Context mode
 */
type ContextMode = "sync" | "eager" | "weak" | "async-weak" | "lazy" | "lazy-once";
type ContextOptions = {
    mode: ContextMode;
    recursive: boolean;
    regExp: RegExp | false | null;
    namespaceObject?: ("strict" | boolean) | undefined;
    addon?: string | undefined;
    chunkName?: Chunk.ChunkName | undefined;
    include?: (RegExp | null) | undefined;
    exclude?: (RegExp | null) | undefined;
    groupOptions?: RawChunkGroupOptions | undefined;
    typePrefix?: string | undefined;
    category?: string | undefined;
    /**
     * exports referenced from modules (won't be mangled)
     */
    referencedExports?: (Dependency.RawReferencedExports | null) | undefined;
    layer?: (string | null) | undefined;
    attributes?: ImportAttributes | undefined;
    phase?: ImportPhaseType | undefined;
    /**
     * glob patterns for import.meta.glob
     */
    patterns?: string[] | undefined;
    /**
     * importer context for import.meta.glob
     */
    requestContext?: string | undefined;
    /**
     * import selection for import.meta.glob
     */
    importName?: string | undefined;
    /**
     * exhaustive mode for import.meta.glob
     */
    exhaustive?: boolean | undefined;
    /**
     * case-sensitive matching for import.meta.glob
     */
    caseSensitive?: boolean | undefined;
};
type ContextModuleOptionsExtras = {
    /**
     * the request of the context as written by the user, before it was resolved
     */
    request?: string | undefined;
    resource: false | string | string[];
    resourceQuery?: string | undefined;
    resourceFragment?: string | undefined;
    resolveOptions?: ResolveOptions | undefined;
};
type ContextModuleOptions = ContextOptions & ContextModuleOptionsExtras;
type ResolveDependenciesCallback = (err: Error | null, dependencies?: ContextElementDependency[] | undefined) => void;
type ResolveDependencies = (fs: InputFileSystem, options: ContextModuleOptions, callback: ResolveDependenciesCallback) => any;
type FakeMapType = 1 | 3 | 7 | 9;
type FakeMap = Record<ChunkGraph.ModuleId, FakeMapType>;
type UserRequestMap = Record<string, ChunkGraph.ModuleId>;
type UserRequestsMap = Record<ChunkGraph.ModuleId, ChunkGraph.ModuleId[]>;
/**
 * Defines the build info properties specific to context modules.
 */
type KnownContextModuleBuildInfo = {
    snapshot?: (InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: import("../fs/FileSystemInfo").FileTimestamps | undefined;
            fileHashes: import("../fs/FileSystemInfo").FileHashes | undefined;
            fileTshs: import("../fs/FileSystemInfo").FileTshs | undefined;
            contextTimestamps: import("../fs/FileSystemInfo").ContextTimestamps | undefined;
            contextHashes: import("../fs/FileSystemInfo").ContextHashes | undefined;
            contextTshs: import("../fs/FileSystemInfo").ContextTshs | undefined;
            missingExistence: import("../fs/FileSystemInfo").MissingExistence | undefined;
            managedItemInfo: import("../fs/FileSystemInfo").ManagedItemInfo | undefined;
            managedFiles: import("../fs/FileSystemInfo").ManagedFiles | undefined;
            managedContexts: import("../fs/FileSystemInfo").ManagedContexts | undefined;
            managedMissing: import("../fs/FileSystemInfo").ManagedMissing | undefined;
            children: import("../fs/FileSystemInfo").Children | undefined;
            hasStartTime(): boolean;
            setStartTime(value: number): void;
            setMergedStartTime(value: number | undefined, snapshot: /*elided*/ any): void;
            hasFileTimestamps(): boolean;
            setFileTimestamps(value: FileTimestamps): void;
            hasFileHashes(): boolean;
            setFileHashes(value: FileHashes): void;
            hasFileTshs(): boolean;
            setFileTshs(value: FileTshs): void;
            hasContextTimestamps(): boolean;
            setContextTimestamps(value: ContextTimestamps): void;
            hasContextHashes(): boolean;
            setContextHashes(value: ContextHashes): void;
            hasContextTshs(): boolean;
            setContextTshs(value: ContextTshs): void;
            hasMissingExistence(): boolean;
            setMissingExistence(value: MissingExistence): void;
            hasManagedItemInfo(): boolean;
            setManagedItemInfo(value: ManagedItemInfo): void;
            hasManagedFiles(): boolean;
            setManagedFiles(value: ManagedFiles): void;
            hasManagedContexts(): boolean;
            setManagedContexts(value: ManagedContexts): void;
            hasManagedMissing(): boolean;
            setManagedMissing(value: ManagedMissing): void;
            hasChildren(): boolean;
            setChildren(value: Children): void;
            addChild(child: /*elided*/ any): void;
            serialize({ write }: import("../serialization/ObjectMiddleware").ObjectSerializerContext): void;
            deserialize({ read }: import("../serialization/ObjectMiddleware").ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: import("../fs/FileSystemInfo").GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: import("../fs/FileSystemInfo").GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }> | null) | undefined;
};
type ContextModuleBuildInfo = Module.BuildInfo & KnownContextModuleBuildInfo;
import type Chunk from "../graph/Chunk";
import type { RawChunkGroupOptions } from "../graph/ChunkGroup";
import type { ImportAttributes } from "../javascript/JavascriptParser";
import type { ResolveOptions } from "../../declarations/WebpackOptions";
import type ContextElementDependency from "../dependencies/context/ContextElementDependency";
import type { InputFileSystem } from "../fs/fs";
