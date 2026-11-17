export = CleanPlugin;
declare class CleanPlugin {
    /** @param {CleanOptions} options options */
    constructor(options?: CleanOptions);
    /** @type {CleanOptions} */
    options: CleanOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace CleanPlugin {
    export { getCompilationHooks, CurrentAssets, Assets, CleanPluginCompilationHooks, KeepFn, Diff };
}
import type { CleanOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * When returning true the file/directory will be kept during cleaning, returning false will clean it and ignore the following plugins and config.
     * @type {SyncBailHook<[string], boolean | void>}
     * @since 5.20.0
     */
    keep: SyncBailHook<[string], boolean | void>;
};
type CurrentAssets = Map<string, number>;
type Assets = Map<string, number>;
type CleanPluginCompilationHooks = ReturnType<typeof createCompilationHooks>;
/**
 * Defines the keep fn callback.
 */
type KeepFn = (path: string) => boolean | undefined;
type Diff = Set<string>;
import { SyncBailHook } from "tapable";
/** @import { CleanOptions } from "../../declarations/WebpackOptions" */
/** @import Compiler from "../Compiler" */
/** @import { Logger } from "../logging/Logger" */
/** @import { IStats, OutputFileSystem, StatsCallback } from "../fs/fs" */
/** @typedef {Map<string, number>} Assets */
declare function createCompilationHooks(): {
    /**
     * When returning true the file/directory will be kept during cleaning, returning false will clean it and ignore the following plugins and config.
     * @type {SyncBailHook<[string], boolean | void>}
     * @since 5.20.0
     */
    keep: SyncBailHook<[string], boolean | void>;
};
