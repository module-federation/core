export = EvalSourceMapDevToolPlugin;
declare class EvalSourceMapDevToolPlugin {
    /**
     * Creates an instance of EvalSourceMapDevToolPlugin.
     * @param {SourceMapDevToolPluginOptions | string=} inputOptions Options object
     */
    constructor(inputOptions?: (SourceMapDevToolPluginOptions | string) | undefined);
    /** @type {string} */
    sourceMapComment: string;
    /** @type {DevtoolModuleFilenameTemplate} */
    moduleFilenameTemplate: DevtoolModuleFilenameTemplate;
    /** @type {DevtoolNamespace} */
    namespace: DevtoolNamespace;
    /** @type {SourceMapDevToolPluginOptions} */
    options: SourceMapDevToolPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type { DevtoolModuleFilenameTemplate } from "../../declarations/WebpackOptions";
import type { DevtoolNamespace } from "../../declarations/WebpackOptions";
import type { SourceMapDevToolPluginOptions } from "./SourceMapDevToolPlugin";
import type Compiler from "../Compiler";
