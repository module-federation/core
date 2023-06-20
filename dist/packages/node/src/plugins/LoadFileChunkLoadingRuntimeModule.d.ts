import type { Chunk, Compiler } from 'webpack';
import { RuntimeModule } from 'webpack';
interface ReadFileChunkLoadingRuntimeModuleOptions {
    baseURI: Compiler['options']['output']['publicPath'];
    promiseBaseURI?: string;
    remotes: Record<string, string>;
    name?: string;
    verbose?: boolean;
}
interface ChunkLoadingContext {
    webpack: Compiler['webpack'];
}
declare class ReadFileChunkLoadingRuntimeModule extends RuntimeModule {
    private runtimeRequirements;
    private options;
    private chunkLoadingContext;
    constructor(runtimeRequirements: Set<string>, options: ReadFileChunkLoadingRuntimeModuleOptions, chunkLoadingContext: ChunkLoadingContext);
    /**
     * @private
     * @param {Chunk} chunk chunk
     * @param {string} rootOutputDir root output directory
     * @returns {string} generated code
     */
    _generateBaseUri(chunk: Chunk, rootOutputDir: string): string;
    /**
     * @private
     * @param {unknown[]} items item to log
     */
    _getLogger(...items: unknown[]): string;
    /**
     * @returns {string} runtime code
     */
    generate(): string;
}
export default ReadFileChunkLoadingRuntimeModule;
