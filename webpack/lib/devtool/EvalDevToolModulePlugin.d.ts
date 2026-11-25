export = EvalDevToolModulePlugin;
declare class EvalDevToolModulePlugin {
    /**
     * Creates an instance of EvalDevToolModulePlugin.
     * @param {EvalDevToolModulePluginOptions=} options options
     */
    constructor(options?: EvalDevToolModulePluginOptions | undefined);
    /** @type {DevtoolNamespace} */
    namespace: DevtoolNamespace;
    /** @type {string} */
    sourceUrlComment: string;
    /** @type {DevtoolModuleFilenameTemplate} */
    moduleFilenameTemplate: DevtoolModuleFilenameTemplate;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace EvalDevToolModulePlugin {
    export { EvalDevToolModulePluginOptions };
}
import type { DevtoolNamespace } from "../../declarations/WebpackOptions";
import type { DevtoolModuleFilenameTemplate } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
/**
 * Defines the eval dev tool module plugin options type used by this module.
 */
type EvalDevToolModulePluginOptions = {
    /**
     * namespace
     */
    namespace?: DevtoolNamespace | undefined;
    /**
     * source url comment
     */
    sourceUrlComment?: string | undefined;
    /**
     * module filename template
     */
    moduleFilenameTemplate?: DevtoolModuleFilenameTemplate | undefined;
};
