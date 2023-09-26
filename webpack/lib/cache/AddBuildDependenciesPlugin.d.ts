export = AddBuildDependenciesPlugin;
/** @typedef {import("../Compiler")} Compiler */
declare class AddBuildDependenciesPlugin {
    /**
     * @param {Iterable<string>} buildDependencies list of build dependencies
     */
    constructor(buildDependencies: Iterable<string>);
    buildDependencies: Set<string>;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace AddBuildDependenciesPlugin {
    export { Compiler };
}
type Compiler = import("../Compiler");
