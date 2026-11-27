export = SystemPlugin;
declare class SystemPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SystemPlugin {
    export { SystemImportDeprecationWarning };
}
import type Compiler from "../../Compiler";
import SystemImportDeprecationWarning = require("../../errors/SystemImportDeprecationWarning");
