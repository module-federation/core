export = DelegatedPlugin;
declare class DelegatedPlugin {
    /**
     * @param {Options} options options
     */
    constructor(options: Options);
    options: DelegatedModuleFactoryPlugin.Options;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DelegatedPlugin {
    export { Compiler, Options };
}
import DelegatedModuleFactoryPlugin = require("./DelegatedModuleFactoryPlugin");
type Compiler = import("./Compiler");
type Options = import("./DelegatedModuleFactoryPlugin").Options;
