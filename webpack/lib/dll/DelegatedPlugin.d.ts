export = DelegatedPlugin;
declare class DelegatedPlugin {
    /**
     * Creates an instance of DelegatedPlugin.
     * @param {Options} options options
     */
    constructor(options: DelegatedModuleFactoryPlugin.Options);
    /** @type {Options} */
    options: DelegatedModuleFactoryPlugin.Options;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import DelegatedModuleFactoryPlugin = require("./DelegatedModuleFactoryPlugin");
import type Compiler from "../Compiler";
