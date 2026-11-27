export = AutomaticPrefetchPlugin;
/**
 * Records modules from one compilation and adds them back as prefetch
 * dependencies in the next compilation.
 */
declare class AutomaticPrefetchPlugin {
    /**
     * Registers hooks that remember previously built normal modules and enqueue
     * them as `PrefetchDependency` requests during the next make phase.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
