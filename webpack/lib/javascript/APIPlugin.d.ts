export = APIPlugin;
declare class APIPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace APIPlugin {
    export { runtimeUsesPublicPathOverride };
    export { usesRuntimePublicPathOverride };
}
import type Compiler from "../Compiler";
/**
 * Whether the public path is reassigned in any runtime the reference belongs to,
 * named either by the module emitting it or by `runtime` directly — a caller holding
 * a chunk rather than a module has only the latter. Falls back to the whole
 * compilation when neither can place it.
 * @param {Compilation} compilation compilation
 * @param {ChunkGraph=} chunkGraph the chunk graph
 * @param {Module=} module the module a reference is emitted into
 * @param {RuntimeSpec=} runtime the runtime it is emitted for, where no module names it
 * @returns {boolean} true when a reassignment can reach those runtimes
 */
declare function runtimeUsesPublicPathOverride(compilation: Compilation, chunkGraph?: ChunkGraph | undefined, module?: Module | undefined, runtime?: RuntimeSpec | undefined): boolean;
/**
 * @param {Compilation} compilation compilation
 * @returns {boolean} true when any module reassigns `__webpack_public_path__` at runtime
 */
declare function usesRuntimePublicPathOverride(compilation: Compilation): boolean;
import type Compilation from "../Compilation";
import type ChunkGraph from "../graph/ChunkGraph";
import type Module from "../module/Module";
import type { RuntimeSpec } from "../util/runtime";
