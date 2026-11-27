export = ElectronTargetPlugin;
declare class ElectronTargetPlugin {
    /**
     * @param {ElectronContext=} context in main, preload or renderer context?
     * @param {ExternalsType=} type default external type
     */
    constructor(context?: ElectronContext | undefined, type?: ExternalsType | undefined);
    /** @type {ElectronContext | undefined} */
    _context: ElectronContext | undefined;
    /** @type {ExternalsType} */
    type: ExternalsType;
    /**
     * @param {Dependency} dependency the dependency
     * @returns {ExternalsType} the external type
     */
    _externalType: (dependency: Dependency) => ExternalsType;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ElectronTargetPlugin {
    export { ElectronContext };
}
import type { ExternalsType } from "../../declarations/WebpackOptions";
import type Dependency from "../graph/Dependency";
import type Compiler from "../Compiler";
type ElectronContext = "main" | "preload" | "renderer";
