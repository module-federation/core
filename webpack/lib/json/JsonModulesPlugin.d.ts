export = JsonModulesPlugin;
/**
 * The JsonModulesPlugin is the entrypoint plugin for the json modules feature.
 * It adds the json module type to the compiler and registers the json parser and generator.
 */
declare class JsonModulesPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
