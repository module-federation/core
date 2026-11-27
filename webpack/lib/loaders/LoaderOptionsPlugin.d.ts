export = LoaderOptionsPlugin;
declare class LoaderOptionsPlugin {
    /**
     * Creates an instance of LoaderOptionsPlugin.
     * @param {LoaderOptionsPluginOptions & MatchObject & Record<string, EXPECTED_ANY>} options options object
     */
    constructor(options?: LoaderOptionsPluginOptions & ModuleFilenameHelpers.MatchObject & Record<string, EXPECTED_ANY>);
    /** @type {LoaderOptionsPluginOptions & MatchObject & Record<string, EXPECTED_ANY>} */
    options: LoaderOptionsPluginOptions & ModuleFilenameHelpers.MatchObject & Record<string, EXPECTED_ANY>;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace LoaderOptionsPlugin {
    export { AbsolutePath, LoaderOptionsPluginLoaderOptions, LoaderOptionsPluginOptions, LoaderContext };
}
import ModuleFilenameHelpers = require("../devtool/ModuleFilenameHelpers");
import type Compiler from "../Compiler";
type AbsolutePath = string;
/**
 * A configuration object that can be used to configure older loaders.
 */
type LoaderOptionsPluginLoaderOptions = {
    /**
     * The context that can be used to configure older loaders.
     */
    context?: AbsolutePath | undefined;
};
type LoaderOptionsPluginOptions = {
    /**
     * Whether loaders should be in debug mode or not. debug will be removed as of webpack 3.
     */
    debug?: boolean | undefined;
    /**
     * Where loaders can be switched to minimize mode.
     */
    minimize?: boolean | undefined;
    options?: (LoaderOptionsPluginLoaderOptions & Record<string, EXPECTED_ANY>) | undefined;
};
/**
 * Defines the loader context type used by this module.
 */
type LoaderContext<T> = import("../module/NormalModule").LoaderContext<T>;
