import type { Compiler, Module } from 'webpack';
import { Compilation } from 'webpack';
/**
 * InvertedContainerPlugin is a Webpack plugin that handles loading of chunks in a federated module.
 */
declare class InvertedContainerPlugin {
    private options;
    /**
     * Constructor for the InvertedContainerPlugin.
     * @param {InvertedContainerOptions} options - Plugin configuration options.
     */
    constructor(options: {
        container: string | undefined;
        runtime: string;
        remotes: Record<string, string>;
        debug: boolean;
    });
    /**
     * Resolves the container module for the given compilation.
     * @param {Compilation} compilation - Webpack compilation instance.
     * @returns {Module | undefined} - The container module or undefined if not found.
     */
    resolveContainerModule(compilation: Compilation): Module | undefined;
    /**
     * Apply method for the Webpack plugin, handling the plugin logic and hooks.
     * @param {Compiler} compiler - Webpack compiler instance.
     */
    apply(compiler: Compiler): void;
}
export default InvertedContainerPlugin;
