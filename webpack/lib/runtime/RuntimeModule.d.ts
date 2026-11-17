export = RuntimeModule;
/**
 * @import {
 * 	WebpackOptionsNormalizedWithDefaults as WebpackOptions
 * } from "../config/defaults"
 */
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Compilation from "../Compilation" */
/** @import { UpdateHashContext } from "../graph/Dependency" */
/**
 * @import {
 * 	BuildMeta,
 * 	BuildInfo,
 * 	BuildCallback,
 * 	CodeGenerationContext,
 * 	CodeGenerationResult,
 * 	NeedBuildCallback,
 * 	NeedBuildContext,
 * 	Sources,
 * 	BasicSourceTypes,
 * 	SourceTypes,
 * 	ModuleKinds
 * } from "../module/Module"
 */
/** @import RequestShortener from "../util/RequestShortener" */
/** @import { ResolverWithOptions } from "../resolve/ResolverFactory" */
/** @import Hash from "../util/Hash" */
/** @import { InputFileSystem } from "../fs/fs" */
declare class RuntimeModule extends Module {
    /**
     * Creates an instance of RuntimeModule.
     * @param {string} name a readable name
     * @param {number=} stage an optional stage
     */
    constructor(name: string, stage?: number | undefined);
    /** @type {string} */
    name: string;
    /** @type {number} */
    stage: number;
    /** @type {Compilation | undefined} */
    compilation: Compilation | undefined;
    /** @type {Chunk | undefined} */
    chunk: Chunk | undefined;
    /** @type {ChunkGraph | undefined} */
    chunkGraph: ChunkGraph | undefined;
    /** @type {boolean} */
    fullHash: boolean;
    /** @type {boolean} */
    dependentHash: boolean;
    /** @type {string | undefined | null} */
    _cachedGeneratedCode: string | undefined | null;
    /**
     * Processes the provided compilation.
     * @param {Compilation} compilation the compilation
     * @param {Chunk} chunk the chunk
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {void}
     */
    attach(compilation: Compilation, chunk: Chunk, chunkGraph?: ChunkGraph): void;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
    /**
     * The `[handlerMap, key]` pairs this module installs onto a chunk handler map
     * such as `__webpack_require__.f`, or `null` where it cannot name them.
     * @returns {[string, string][] | null} installed chunk handlers (do not mutate)
     */
    getInstalledChunkHandlers(): [string, string][] | null;
    /**
     * Generates runtime code for this runtime module.
     * @abstract
     * @returns {string | null} runtime code
     */
    generate(): string | null;
    /**
     * Gets generated code.
     * @returns {string | null} runtime code
     */
    getGeneratedCode(): string | null;
    /**
     * Returns true, if the runtime module should get it's own scope.
     * When false, `generate()` must emit complete statements ending with `;`
     * so a following runtime IIFE is not parsed as a call (ASI).
     * @returns {boolean} true, if the runtime module should get it's own scope
     */
    shouldIsolate(): boolean;
}
declare namespace RuntimeModule {
    let NO_CHUNK_HANDLERS: [string, string][];
    let STAGE_NORMAL: number;
    let STAGE_BASIC: number;
    let STAGE_ATTACH: number;
    let STAGE_TRIGGER: number;
    let KINDS: Set<keyof Module.ModuleKinds>;
}
import Module = require("../module/Module");
import type Compilation from "../Compilation";
import type Chunk from "../graph/Chunk";
import type ChunkGraph from "../graph/ChunkGraph";
import type Hash from "../util/Hash";
import type { UpdateHashContext } from "../graph/Dependency";
