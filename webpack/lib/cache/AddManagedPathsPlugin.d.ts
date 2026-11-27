export = AddManagedPathsPlugin;
/** @import Compiler from "../Compiler" */
declare class AddManagedPathsPlugin {
    /**
     * Creates an instance of AddManagedPathsPlugin.
     * @param {Iterable<string | RegExp>} managedPaths list of managed paths
     * @param {Iterable<string | RegExp>} immutablePaths list of immutable paths
     * @param {Iterable<string | RegExp>} unmanagedPaths list of unmanaged paths
     */
    constructor(managedPaths: Iterable<string | RegExp>, immutablePaths: Iterable<string | RegExp>, unmanagedPaths: Iterable<string | RegExp>);
    /** @type {Set<string | RegExp>} */
    managedPaths: Set<string | RegExp>;
    /** @type {Set<string | RegExp>} */
    immutablePaths: Set<string | RegExp>;
    /** @type {Set<string | RegExp>} */
    unmanagedPaths: Set<string | RegExp>;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
