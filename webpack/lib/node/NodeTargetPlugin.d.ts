export = NodeTargetPlugin;
/** @import { ExternalsType } from "../../declarations/WebpackOptions" */
/** @import Compiler from "../Compiler" */
declare class NodeTargetPlugin {
    /**
     * Creates an instance of NodeTargetPlugin.
     * @param {ExternalsType} type default external type
     */
    constructor(type?: ExternalsType);
    /** @type {ExternalsType} */
    type: ExternalsType;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NodeTargetPlugin {
    export { builtins };
}
import type { ExternalsType } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
import { builtins } from "./nodeBuiltins";
