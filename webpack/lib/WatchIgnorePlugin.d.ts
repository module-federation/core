export = WatchIgnorePlugin;
declare class WatchIgnorePlugin {
    /**
     * @param {WatchIgnorePluginOptions} options options
     */
    constructor(options: WatchIgnorePluginOptions);
    paths: (string | RegExp)[];
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace WatchIgnorePlugin {
    export { WatchIgnorePluginOptions, Compiler, TimeInfoEntries, WatchFileSystem, WatchMethod, Watcher };
}
type WatchIgnorePluginOptions = import("../declarations/plugins/WatchIgnorePlugin").WatchIgnorePluginOptions;
type Compiler = import("./Compiler");
type TimeInfoEntries = import("./util/fs").TimeInfoEntries;
type WatchFileSystem = import("./util/fs").WatchFileSystem;
type WatchMethod = import("./util/fs").WatchMethod;
type Watcher = import("./util/fs").Watcher;
