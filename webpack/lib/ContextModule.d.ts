export = ContextModule;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../declarations/WebpackOptions").ResolveOptions} ResolveOptions */
/** @typedef {import("./config/defaults").WebpackOptionsNormalizedWithDefaults} WebpackOptions */
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {import("./Chunk").ChunkId} ChunkId */
/** @typedef {import("./Chunk").ChunkName} ChunkName */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./ChunkGraph").ModuleId} ModuleId */
/** @typedef {import("./ChunkGroup").RawChunkGroupOptions} RawChunkGroupOptions */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Dependency").RawReferencedExports} RawReferencedExports */
/** @typedef {import("./Generator").SourceTypes} SourceTypes */
/** @typedef {import("./Module").BuildCallback} BuildCallback */
/** @typedef {import("./Module").BuildInfo} BuildInfo */
/** @typedef {import("./Module").FileSystemDependencies} FileSystemDependencies */
/** @typedef {import("./Module").BuildMeta} BuildMeta */
/** @typedef {import("./Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("./Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("./Module").LibIdentOptions} LibIdentOptions */
/** @typedef {import("./Module").LibIdent} LibIdent */
/** @typedef {import("./Module").NeedBuildCallback} NeedBuildCallback */
/** @typedef {import("./Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("./RequestShortener")} RequestShortener */
/** @typedef {import("./ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("./dependencies/ContextElementDependency")} ContextElementDependency */
/** @typedef {import("./javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./util/fs").InputFileSystem} InputFileSystem */
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
 */
/**
 * @typedef {object} ContextModuleOptionsExtras
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
    _identifier: string;
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
     * @returns {Map<string, ModuleId>} map with user requests
     */
    getUserRequestMap(dependencies: Dependency[], chunkGraph: ChunkGraph): Map<string, ModuleId>;
    /**
     * @param {Dependency[]} dependencies all dependencies
     * @param {ChunkGraph} chunkGraph chunk graph
     * @returns {FakeMap | FakeMapType} fake map
     */
    getFakeMap(dependencies: Dependency[], chunkGraph: ChunkGraph): FakeMap | FakeMapType;
    /**
     * @param {FakeMap | FakeMapType} fakeMap fake map
     * @returns {string} fake map init statement
     */
    getFakeMapInitStatement(fakeMap: FakeMap | FakeMapType): string;
    /**
     * @param {FakeMapType} type type
     * @param {boolean=} asyncModule is async module
     * @returns {string} return result
     */
    getReturn(type: FakeMapType, asyncModule?: boolean | undefined): string;
    /**
     * @param {FakeMap | FakeMapType} fakeMap fake map
     * @param {boolean=} asyncModule us async module
     * @param {string=} fakeMapDataExpression fake map data expression
     * @returns {string} module object source
     */
    getReturnModuleObjectSource(fakeMap: FakeMap | FakeMapType, asyncModule?: boolean | undefined, fakeMapDataExpression?: string | undefined): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {string} source code
     */
    getSyncSource(dependencies: Dependency[], id: ModuleId, chunkGraph: ChunkGraph): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {string} source code
     */
    getWeakSyncSource(dependencies: Dependency[], id: ModuleId, chunkGraph: ChunkGraph): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {object} context context
     * @param {ChunkGraph} context.chunkGraph the chunk graph
     * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
     * @returns {string} source code
     */
    getAsyncWeakSource(dependencies: Dependency[], id: ModuleId, { chunkGraph, runtimeTemplate }: {
        chunkGraph: ChunkGraph;
        runtimeTemplate: RuntimeTemplate;
    }): string;
    /**
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {object} context context
     * @param {ChunkGraph} context.chunkGraph the chunk graph
     * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
     * @returns {string} source code
     */
    getEagerSource(dependencies: Dependency[], id: ModuleId, { chunkGraph, runtimeTemplate }: {
        chunkGraph: ChunkGraph;
        runtimeTemplate: RuntimeTemplate;
    }): string;
    /**
     * @param {AsyncDependenciesBlock} block block
     * @param {Dependency[]} dependencies dependencies
     * @param {ModuleId} id module id
     * @param {object} options options object
     * @param {RuntimeTemplate} options.runtimeTemplate the runtime template
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @returns {string} source code
     */
    getLazyOnceSource(block: AsyncDependenciesBlock, dependencies: Dependency[], id: ModuleId, { runtimeTemplate, chunkGraph }: {
        runtimeTemplate: RuntimeTemplate;
        chunkGraph: ChunkGraph;
    }): string;
    /**
     * @param {AsyncDependenciesBlock[]} blocks blocks
     * @param {ModuleId} id module id
     * @param {object} context context
     * @param {ChunkGraph} context.chunkGraph the chunk graph
     * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
     * @returns {string} source code
     */
    getLazySource(blocks: AsyncDependenciesBlock[], id: ModuleId, { chunkGraph, runtimeTemplate }: {
        chunkGraph: ChunkGraph;
        runtimeTemplate: RuntimeTemplate;
    }): string;
    /**
     * @param {ModuleId} id module id
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @returns {string} source for empty async context
     */
    getSourceForEmptyContext(id: ModuleId, runtimeTemplate: RuntimeTemplate): string;
    /**
     * @param {ModuleId} id module id
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @returns {string} source for empty async context
     */
    getSourceForEmptyAsyncContext(id: ModuleId, runtimeTemplate: RuntimeTemplate): string;
    /**
     * @param {string} asyncMode module mode
     * @param {CodeGenerationContext} context context info
     * @returns {string} the source code
     */
    getSourceString(asyncMode: string, { runtimeTemplate, chunkGraph }: CodeGenerationContext): string;
    /**
     * @param {string} sourceString source content
     * @param {Compilation=} compilation the compilation
     * @returns {Source} generated source
     */
    getSource(sourceString: string, compilation?: Compilation | undefined): Source;
}
declare namespace ContextModule {
    export { Source, ResolveOptions, WebpackOptions, Chunk, ChunkId, ChunkName, ChunkGraph, ModuleId, RawChunkGroupOptions, Compilation, Dependency, RawReferencedExports, SourceTypes, BuildCallback, BuildInfo, FileSystemDependencies, BuildMeta, CodeGenerationContext, CodeGenerationResult, LibIdentOptions, LibIdent, NeedBuildCallback, NeedBuildContext, RequestShortener, ResolverWithOptions, RuntimeTemplate, ContextElementDependency, ImportAttributes, ObjectDeserializerContext, ObjectSerializerContext, InputFileSystem, ContextMode, ContextOptions, ContextModuleOptionsExtras, ContextModuleOptions, ResolveDependenciesCallback, ResolveDependencies, FakeMapType, FakeMap };
}
import Module = require("./Module");
import AsyncDependenciesBlock = require("./AsyncDependenciesBlock");
type Source = import("webpack-sources").Source;
type ResolveOptions = import("../declarations/WebpackOptions").ResolveOptions;
type WebpackOptions = import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
type Chunk = import("./Chunk");
type ChunkId = import("./Chunk").ChunkId;
type ChunkName = import("./Chunk").ChunkName;
type ChunkGraph = import("./ChunkGraph");
type ModuleId = import("./ChunkGraph").ModuleId;
type RawChunkGroupOptions = import("./ChunkGroup").RawChunkGroupOptions;
type Compilation = import("./Compilation");
type Dependency = import("./Dependency");
type RawReferencedExports = import("./Dependency").RawReferencedExports;
type SourceTypes = import("./Generator").SourceTypes;
type BuildCallback = import("./Module").BuildCallback;
type BuildInfo = import("./Module").BuildInfo;
type FileSystemDependencies = import("./Module").FileSystemDependencies;
type BuildMeta = import("./Module").BuildMeta;
type CodeGenerationContext = import("./Module").CodeGenerationContext;
type CodeGenerationResult = import("./Module").CodeGenerationResult;
type LibIdentOptions = import("./Module").LibIdentOptions;
type LibIdent = import("./Module").LibIdent;
type NeedBuildCallback = import("./Module").NeedBuildCallback;
type NeedBuildContext = import("./Module").NeedBuildContext;
type RequestShortener = import("./RequestShortener");
type ResolverWithOptions = import("./ResolverFactory").ResolverWithOptions;
type RuntimeTemplate = import("./RuntimeTemplate");
type ContextElementDependency = import("./dependencies/ContextElementDependency");
type ImportAttributes = import("./javascript/JavascriptParser").ImportAttributes;
type ObjectDeserializerContext = import("./serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./serialization/ObjectMiddleware").ObjectSerializerContext;
type InputFileSystem = import("./util/fs").InputFileSystem;
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
    chunkName?: ChunkName | undefined;
    include?: (RegExp | null) | undefined;
    exclude?: (RegExp | null) | undefined;
    groupOptions?: RawChunkGroupOptions | undefined;
    typePrefix?: string | undefined;
    category?: string | undefined;
    /**
     * exports referenced from modules (won't be mangled)
     */
    referencedExports?: (RawReferencedExports | null) | undefined;
    layer?: (string | null) | undefined;
    attributes?: ImportAttributes | undefined;
};
type ContextModuleOptionsExtras = {
    resource: false | string | string[];
    resourceQuery?: string | undefined;
    resourceFragment?: string | undefined;
    resolveOptions?: ResolveOptions | undefined;
};
type ContextModuleOptions = ContextOptions & ContextModuleOptionsExtras;
type ResolveDependenciesCallback = (err: Error | null, dependencies?: ContextElementDependency[] | undefined) => void;
type ResolveDependencies = (fs: InputFileSystem, options: ContextModuleOptions, callback: ResolveDependenciesCallback) => any;
type FakeMapType = 1 | 3 | 7 | 9;
type FakeMap = Record<ModuleId, FakeMapType>;
