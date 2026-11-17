export = WebAssemblyModulesPlugin;
/**
 * Options that influence how synchronous WebAssembly modules are transformed
 * and emitted.
 * @typedef {object} WebAssemblyModulesPluginOptions
 * @property {boolean=} mangleImports mangle imports
 */
/**
 * Adds parser, generator, manifest, and validation support for synchronous
 * WebAssembly modules in the compilation pipeline.
 */
declare class WebAssemblyModulesPlugin {
    /**
     * Stores options that affect generated synchronous WebAssembly output.
     * @param {WebAssemblyModulesPluginOptions} options options
     */
    constructor(options: WebAssemblyModulesPluginOptions);
    /** @type {WebAssemblyModulesPluginOptions} */
    options: WebAssemblyModulesPluginOptions;
    /**
     * Registers compilation hooks that parse and generate sync WebAssembly
     * modules, emit their binary assets, and report invalid placement in initial
     * chunks.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace WebAssemblyModulesPlugin {
    export { WebAssemblyModulesPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Options that influence how synchronous WebAssembly modules are transformed
 * and emitted.
 */
type WebAssemblyModulesPluginOptions = {
    /**
     * mangle imports
     */
    mangleImports?: boolean | undefined;
};
