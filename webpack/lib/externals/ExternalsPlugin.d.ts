export = ExternalsPlugin;
declare class ExternalsPlugin {
    /**
     * Creates an instance of ExternalsPlugin.
     * @param {ExternalsType | ((dependency: Dependency) => ExternalsType)} type default external type
     * @param {Externals} externals externals config
     */
    constructor(type: ExternalsType | ((dependency: Dependency) => ExternalsType), externals: Externals);
    type: ExternalsType | ((dependency: Dependency) => ExternalsType);
    /** @type {Externals} */
    externals: Externals;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type { ExternalsType } from "../../declarations/WebpackOptions";
import type Dependency from "../graph/Dependency";
import type { Externals } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
