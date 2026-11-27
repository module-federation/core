export = WorkerAndWorkletPlugin;
declare class WorkerAndWorkletPlugin {
    /**
     * Creates an instance of WorkerAndWorkletPlugin.
     * @param {ChunkLoading=} chunkLoading chunk loading
     * @param {WasmLoading=} wasmLoading wasm loading
     * @param {OutputModule=} module output module
     * @param {WorkerPublicPath=} workerPublicPath worker public path
     * @param {boolean=} workletDefault whether worklet parsing is on when `parser.worklet` is unset (enabled by `futureDefaults`)
     */
    constructor(chunkLoading?: ChunkLoading | undefined, wasmLoading?: WasmLoading | undefined, module?: OutputModule | undefined, workerPublicPath?: WorkerPublicPath | undefined, workletDefault?: boolean | undefined);
    /** @type {ChunkLoading | undefined} */
    _chunkLoading: ChunkLoading | undefined;
    /** @type {WasmLoading | undefined} */
    _wasmLoading: WasmLoading | undefined;
    /** @type {boolean | undefined} */
    _module: boolean | undefined;
    /** @type {string | undefined} */
    _workerPublicPath: string | undefined;
    /** @type {boolean} */
    _workletDefault: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type { ChunkLoading } from "../../../declarations/WebpackOptions";
import type { WasmLoading } from "../../../declarations/WebpackOptions";
import type Compiler from "../../Compiler";
import type { OutputModule } from "../../../declarations/WebpackOptions";
import type { WorkerPublicPath } from "../../../declarations/WebpackOptions";
