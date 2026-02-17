export = HoistContainerReferences;
/**
 * This class is used to hoist container references in the code.
 */
declare class HoistContainerReferences {
    /**
     * Apply the plugin to the compiler.
     * @param {Compiler} compiler The webpack compiler instance.
     */
    apply(compiler: Compiler): void;
    /**
     * Hoist modules in chunks.
     * @param {Compilation} compilation The webpack compilation instance.
     * @param {Set<Dependency>} depsToTrace Set of container entry dependencies.
     * @param {Set<Dependency>} entryExternalsToHoist Set of container entry dependencies to hoist.
     */
    hoistModulesInChunks(compilation: Compilation, depsToTrace: Set<Dependency>, entryExternalsToHoist: Set<Dependency>): void;
    /**
     * Clean up chunks by disconnecting unused modules.
     * @param {Compilation} compilation The webpack compilation instance.
     * @param {Set<Module>} modules Set of modules to clean up.
     */
    cleanUpChunks(compilation: Compilation, modules: Set<Module>): void;
}
declare namespace HoistContainerReferences {
    export { Compilation, Compiler, Dependency, Module };
}
type Compilation = import("../Compilation");
type Compiler = import("../Compiler");
type Dependency = import("../Dependency");
type Module = import("../Module");
