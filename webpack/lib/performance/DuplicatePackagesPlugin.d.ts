export = DuplicatePackagesPlugin;
declare class DuplicatePackagesPlugin {
    /**
     * Creates an instance of DuplicatePackagesPlugin.
     * @param {PerformanceOptions} options the plugin options
     */
    constructor(options: PerformanceOptions);
    /** @type {PerformanceOptions["hints"]} */
    hints: PerformanceOptions["hints"];
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DuplicatePackagesPlugin {
    export { PackageCopy };
}
import type { PerformanceOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
/**
 * One copy of a package, identified by the directory its description file
 * (usually `package.json`) lives in.
 */
type PackageCopy = {
    /**
     * version of this copy
     */
    version: string;
    /**
     * directory of this copy
     */
    path: string;
    /**
     * modules included from this copy
     */
    modules: Module[];
};
import type Module from "../module/Module";
