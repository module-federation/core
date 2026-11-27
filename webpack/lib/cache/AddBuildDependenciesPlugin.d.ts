export = AddBuildDependenciesPlugin;
/**
 * @typedef {object} NormalizedBuildDependencyItem
 * @property {string} dependency request to resolve
 * @property {boolean} optional when true the dependency may be missing
 */
declare class AddBuildDependenciesPlugin {
    /**
     * Creates an instance of AddBuildDependenciesPlugin.
     * @param {NormalizedBuildDependencyItem[]} buildDependencies normalized build dependencies
     */
    constructor(buildDependencies: NormalizedBuildDependencyItem[]);
    buildDependencies: NormalizedBuildDependencyItem[];
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace AddBuildDependenciesPlugin {
    export { NormalizedBuildDependencyItem };
}
import type Compiler from "../Compiler";
type NormalizedBuildDependencyItem = {
    /**
     * request to resolve
     */
    dependency: string;
    /**
     * when true the dependency may be missing
     */
    optional: boolean;
};
