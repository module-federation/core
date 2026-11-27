export = SizeLimitsPlugin;
declare class SizeLimitsPlugin {
    /**
     * Checks whether this size limits plugin is over size limit.
     * @param {Entrypoint | ChunkGroup | Source} thing the resource to test
     * @returns {boolean} true if over the limit
     */
    static isOverSizeLimit(thing: Entrypoint | ChunkGroup | Source): boolean;
    /**
     * Creates an instance of SizeLimitsPlugin.
     * @param {PerformanceOptions} options the plugin options
     */
    constructor(options: PerformanceOptions);
    /** @type {PerformanceOptions["hints"]} */
    hints: PerformanceOptions["hints"];
    /** @type {number | undefined} */
    maxAssetSize: number | undefined;
    /** @type {number | undefined} */
    maxEntrypointSize: number | undefined;
    /** @type {AssetFilter | undefined} */
    assetFilter: AssetFilter | undefined;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SizeLimitsPlugin {
    export { ModuleDetails, AssetDetails, EntrypointDetails, AssetFilter };
}
import type { PerformanceOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
import type Entrypoint from "../graph/Entrypoint";
import type ChunkGroup from "../graph/ChunkGroup";
import type { Source } from "webpack-sources";
/**
 * Defines the module details type used by this module.
 */
type ModuleDetails = {
    name: string;
    size: number;
};
/**
 * Defines the asset details type used by this module.
 */
type AssetDetails = {
    name: string;
    size: number;
    modules?: ModuleDetails[] | undefined;
};
/**
 * Defines the entrypoint details type used by this module.
 */
type EntrypointDetails = {
    name: string;
    size: number;
    files: string[];
};
type AssetFilter = (name: Compilation.Asset["name"], source: Compilation.Asset["source"], assetInfo: Compilation.Asset["info"]) => boolean;
import type Compilation from "../Compilation";
