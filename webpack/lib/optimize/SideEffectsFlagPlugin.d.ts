export = SideEffectsFlagPlugin;
declare class SideEffectsFlagPlugin {
    /**
     * Module has side effects.
     * @param {string} moduleName the module name
     * @param {SideEffectsFlagValue} flagValue the flag value
     * @param {CacheItem} cache cache for glob to regexp
     * @returns {boolean | undefined} true, when the module has side effects, undefined or false when not
     */
    static moduleHasSideEffects(moduleName: string, flagValue: SideEffectsFlagValue, cache: CacheItem): boolean | undefined;
    /**
     * Creates an instance of SideEffectsFlagPlugin.
     * @param {boolean} analyseSource analyse source code for side effects
     */
    constructor(analyseSource?: boolean);
    /** @type {boolean} */
    _analyseSource: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SideEffectsFlagPlugin {
    export { ExportInModule, ResourceResolveData, SideEffectsFlagValue, CacheItem, ResolvedSideEffectsFlag, OwningSideEffectsFlag, OwningSideEffectsFlagWalk, OwningSideEffectsFlagCache };
}
import type Compiler from "../Compiler";
/**
 * Defines the export in module type used by this module.
 */
type ExportInModule = {
    /**
     * the module
     */
    module: Module;
    /**
     * the name of the export
     */
    exportName: string;
    /**
     * if the export is conditional
     */
    checked: boolean;
};
type ResourceResolveData = NonNullable<CreateData["resourceResolveData"]>;
type SideEffectsFlagValue = string | boolean | string[] | undefined;
type CacheItem = Map<string, RegExp>;
type ResolvedSideEffectsFlag = {
    /**
     * package.json sideEffects value
     */
    sideEffects: SideEffectsFlagValue;
    /**
     * path relative to the owning package root
     */
    relativePath: string;
};
type OwningSideEffectsFlag = {
    /**
     * package.json sideEffects value
     */
    sideEffects: SideEffectsFlagValue;
    /**
     * directory of the declaring package.json
     */
    packageRoot: string;
};
/**
 * A finished ancestor walk, kept per descriptionFileRoot. The package.json
 * paths it consulted are replayed as dependencies for every module reusing it.
 */
type OwningSideEffectsFlagWalk = {
    /**
     * declaring package, `null` when the walk found none
     */
    owning: OwningSideEffectsFlag | null;
    /**
     * package.json files the walk read
     */
    read: string[];
    /**
     * package.json files the walk did not find
     */
    missing: string[];
};
type OwningSideEffectsFlagCache = Map<string, OwningSideEffectsFlagWalk>;
import type Module from "../module/Module";
import type { CreateData } from "../module/NormalModuleFactory";
