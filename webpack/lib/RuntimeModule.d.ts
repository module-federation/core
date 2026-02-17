export = RuntimeModule;
/** @typedef {import("./config/defaults").WebpackOptionsNormalizedWithDefaults} WebpackOptions */
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("./Generator").SourceTypes} SourceTypes */
/** @typedef {import("./Module").BuildCallback} BuildCallback */
/** @typedef {import("./Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("./Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("./Module").NeedBuildCallback} NeedBuildCallback */
/** @typedef {import("./Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("./RequestShortener")} RequestShortener */
/** @typedef {import("./ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {import("./util/fs").InputFileSystem} InputFileSystem */
declare class RuntimeModule extends Module {
    /**
     * @param {string} name a readable name
     * @param {number=} stage an optional stage
     */
    constructor(name: string, stage?: number | undefined);
    name: string;
    stage: number;
    buildMeta: {};
    buildInfo: {};
    /** @type {Compilation | undefined} */
    compilation: Compilation | undefined;
    /** @type {Chunk | undefined} */
    chunk: Chunk | undefined;
    /** @type {ChunkGraph | undefined} */
    chunkGraph: ChunkGraph | undefined;
    fullHash: boolean;
    dependentHash: boolean;
    /** @type {string | undefined | null} */
    _cachedGeneratedCode: string | undefined | null;
    /**
     * @param {Compilation} compilation the compilation
     * @param {Chunk} chunk the chunk
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {void}
     */
    attach(compilation: Compilation, chunk: Chunk, chunkGraph?: ChunkGraph): void;
    /**
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
    /**
     * @abstract
     * @returns {string | null} runtime code
     */
    generate(): string | null;
    /**
     * @returns {string | null} runtime code
     */
    getGeneratedCode(): string | null;
    /**
     * @returns {boolean} true, if the runtime module should get it's own scope
     */
    shouldIsolate(): boolean;
}
declare namespace RuntimeModule {
    export { STAGE_NORMAL, STAGE_BASIC, STAGE_ATTACH, STAGE_TRIGGER, WebpackOptions, Chunk, ChunkGraph, Compilation, UpdateHashContext, SourceTypes, BuildCallback, CodeGenerationContext, CodeGenerationResult, NeedBuildCallback, NeedBuildContext, RequestShortener, ResolverWithOptions, Hash, InputFileSystem };
}
import Module = require("./Module");
declare var STAGE_NORMAL: number;
declare var STAGE_BASIC: number;
declare var STAGE_ATTACH: number;
declare var STAGE_TRIGGER: number;
type WebpackOptions = import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
type Chunk = import("./Chunk");
type ChunkGraph = import("./ChunkGraph");
type Compilation = import("./Compilation");
type UpdateHashContext = import("./Dependency").UpdateHashContext;
type SourceTypes = import("./Generator").SourceTypes;
type BuildCallback = import("./Module").BuildCallback;
type CodeGenerationContext = import("./Module").CodeGenerationContext;
type CodeGenerationResult = import("./Module").CodeGenerationResult;
type NeedBuildCallback = import("./Module").NeedBuildCallback;
type NeedBuildContext = import("./Module").NeedBuildContext;
type RequestShortener = import("./RequestShortener");
type ResolverWithOptions = import("./ResolverFactory").ResolverWithOptions;
type Hash = import("./util/Hash");
type InputFileSystem = import("./util/fs").InputFileSystem;
