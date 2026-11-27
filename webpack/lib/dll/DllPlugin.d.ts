export = DllPlugin;
declare class DllPlugin {
    /**
     * Creates an instance of DllPlugin.
     * @param {DllPluginOptions} options options object
     */
    constructor(options: DllPluginOptions);
    /** @type {DllPluginOptions} */
    options: DllPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DllPlugin {
    export { NonEmptyString, DllPluginOptions };
}
import type Compiler from "../Compiler";
type NonEmptyString = string;
type DllPluginOptions = {
    /**
     * Context of requests in the manifest file (defaults to the webpack context).
     */
    context?: NonEmptyString | undefined;
    /**
     * If true, only entry points will be exposed (default: true).
     */
    entryOnly?: boolean | undefined;
    /**
     * If true, manifest json file (output) will be formatted.
     */
    format?: boolean | undefined;
    /**
     * Name of the exposed dll function (external name, use value of 'output.library').
     */
    name?: NonEmptyString | undefined;
    /**
     * Absolute path to the manifest json file (output).
     */
    path: NonEmptyString;
    /**
     * Type of the dll bundle (external type, use value of 'output.libraryTarget').
     */
    type?: NonEmptyString | undefined;
};
