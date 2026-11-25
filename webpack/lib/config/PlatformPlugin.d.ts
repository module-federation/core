export = PlatformPlugin;
/**
 * Should be used only for "target === false" or
 * when you want to overwrite platform target properties
 */
declare class PlatformPlugin {
    /**
     * Creates an instance of PlatformPlugin.
     * @param {Partial<PlatformTargetProperties>} platform target properties
     */
    constructor(platform: Partial<PlatformTargetProperties>);
    /** @type {Partial<PlatformTargetProperties>} */
    platform: Partial<PlatformTargetProperties>;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type { PlatformTargetProperties } from "./target";
import type Compiler from "../Compiler";
