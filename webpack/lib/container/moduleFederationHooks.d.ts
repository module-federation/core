export = getCompilationHooks;
/** @typedef {ReturnType<typeof createCompilationHooks>} CompilationHooks */
declare const getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * @type {SyncHook<Dependency>}
     * @since 5.96.0
     */
    addContainerEntryDependency: SyncHook<Dependency>;
    /**
     * @type {SyncHook<Dependency>}
     * @since 5.96.0
     */
    addFederationRuntimeDependency: SyncHook<Dependency>;
};
declare namespace getCompilationHooks {
    export { CompilationHooks };
}
import { SyncHook } from "tapable";
import type Dependency from "../graph/Dependency";
type CompilationHooks = ReturnType<typeof createCompilationHooks>;
/** @import Dependency from "../graph/Dependency" */
declare function createCompilationHooks(): {
    /**
     * @type {SyncHook<Dependency>}
     * @since 5.96.0
     */
    addContainerEntryDependency: SyncHook<Dependency>;
    /**
     * @type {SyncHook<Dependency>}
     * @since 5.96.0
     */
    addFederationRuntimeDependency: SyncHook<Dependency>;
};
