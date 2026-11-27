export = WatchIgnorePlugin;
declare class WatchIgnorePlugin {
    /**
     * Creates an instance of WatchIgnorePlugin.
     * @param {WatchIgnorePluginOptions} options options
     */
    constructor(options: WatchIgnorePluginOptions);
    /** @type {WatchIgnorePluginOptions} */
    options: WatchIgnorePluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace WatchIgnorePlugin {
    export { WatchIgnoreAbsolutePath, WatchIgnoreGlob, WatchIgnoreEntry, WatchIgnorePaths, WatchIgnorePluginOptions };
}
import type Compiler from "../Compiler";
/**
 * An absolute path to a directory or file that should be ignored.
 */
type WatchIgnoreAbsolutePath = string;
/**
 * A glob matching, at any depth, the directories or files that should be ignored.
 */
type WatchIgnoreGlob = string;
/**
 * RegExp, absolute path or glob to directories or files that should be ignored.
 */
type WatchIgnoreEntry = RegExp | WatchIgnoreAbsolutePath | WatchIgnoreGlob;
/**
 * A list of RegExps, absolute paths or globs to directories or files that should be ignored.
 */
type WatchIgnorePaths = WatchIgnoreEntry[];
type WatchIgnorePluginOptions = {
    paths: WatchIgnorePaths;
};
