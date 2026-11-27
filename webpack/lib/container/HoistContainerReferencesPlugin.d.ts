export = HoistContainerReferencesPlugin;
/**
 * This class is used to hoist container references in the code.
 */
declare class HoistContainerReferencesPlugin {
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
     * Connect `referencedModules` into each runtime chunk of `entryModule`, then
     * prune the chunks they were hoisted out of. The two passes above build
     * `referencedModules` differently but hoist them identically.
     * @param {Compilation} compilation The webpack compilation instance.
     * @param {Module} entryModule The module whose runtimes receive the modules.
     * @param {Set<Module>} referencedModules The modules to hoist.
     */
    hoistReferencedModules(compilation: Compilation, entryModule: Module, referencedModules: Set<Module>): void;
    /**
     * Clean up chunks by disconnecting unused modules.
     * @param {Compilation} compilation The webpack compilation instance.
     * @param {Set<Module>} modules Set of modules to clean up.
     */
    cleanUpChunks(compilation: Compilation, modules: Set<Module>): void;
}
import type Compiler from "../Compiler";
import type Compilation from "../Compilation";
import type Dependency from "../graph/Dependency";
import type Module from "../module/Module";
