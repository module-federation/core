export = RuntimeModule;
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
  /** @type {string | undefined} */
  _cachedGeneratedCode: string | undefined;
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
  export {
    STAGE_NORMAL,
    STAGE_BASIC,
    STAGE_ATTACH,
    STAGE_TRIGGER,
    Source,
    WebpackOptions,
    Chunk,
    ChunkGraph,
    Compilation,
    UpdateHashContext,
    CodeGenerationContext,
    CodeGenerationResult,
    NeedBuildContext,
    RequestShortener,
    ResolverWithOptions,
    WebpackError,
    Hash,
    InputFileSystem,
  };
}
import Module = require('./Module');
type Compilation = import('./Compilation');
type Chunk = import('./Chunk');
type ChunkGraph = import('./ChunkGraph');
type Hash = import('./util/Hash');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
declare var STAGE_NORMAL: number;
declare var STAGE_BASIC: number;
declare var STAGE_ATTACH: number;
declare var STAGE_TRIGGER: number;
type Source = any;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type NeedBuildContext = import('./Module').NeedBuildContext;
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type WebpackError = import('./WebpackError');
type InputFileSystem = import('./util/fs').InputFileSystem;
