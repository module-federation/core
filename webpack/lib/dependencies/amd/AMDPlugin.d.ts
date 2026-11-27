export = AMDPlugin;
/** @typedef {Exclude<Amd, false>} AmdOptions */
declare class AMDPlugin {
    /**
     * Creates an instance of AMDPlugin.
     * @param {AmdOptions} amdOptions the AMD options
     */
    constructor(amdOptions: AmdOptions);
    amdOptions: {
        [key: string]: any;
    };
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace AMDPlugin {
    export { AmdOptions };
}
import type Compiler from "../../Compiler";
type AmdOptions = Exclude<Amd, false>;
import type { Amd } from "../../../declarations/WebpackOptions";
