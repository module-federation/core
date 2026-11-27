export = URLPlugin;
declare class URLPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler compiler
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../../Compiler";
