import type { Compiler, Module } from 'webpack';
import { RuntimeModule } from 'webpack';
/**
 * Interface for InvertedContainerRuntimeModuleOptions, containing
 * options for the InvertedContainerRuntimeModule class.
 */
interface InvertedContainerRuntimeModuleOptions {
    runtime: string;
    remotes: Record<string, string>;
    name?: string;
    debug?: boolean;
    container?: string;
}
/**
 * Interface for ChunkLoadingContext, containing Webpack-related properties.
 */
interface ChunkLoadingContext {
    webpack: Compiler['webpack'];
    debug?: boolean;
}
/**
 * InvertedContainerRuntimeModule is a Webpack runtime module that generates
 * the runtime code needed for loading federated modules in an inverted container.
 */
declare class InvertedContainerRuntimeModule extends RuntimeModule {
    private runtimeRequirements;
    private options;
    private chunkLoadingContext;
    /**
     * Constructor for the InvertedContainerRuntimeModule.
     * @param {Set<string>} runtimeRequirements - A set of runtime requirement strings.
     * @param {InvertedContainerRuntimeModuleOptions} options - Runtime module options.
     * @param {ChunkLoadingContext} chunkLoadingContext - Chunk loading context.
     */
    constructor(runtimeRequirements: Set<string>, options: InvertedContainerRuntimeModuleOptions, chunkLoadingContext: ChunkLoadingContext);
    resolveContainerModule(): Module | undefined;
    mapShared(): string;
    mapChunks(): string;
    /**
     * Generate method for the runtime module, producing the runtime code.
     * @returns {string} runtime code
     */
    generate(): string;
}
export default InvertedContainerRuntimeModule;
