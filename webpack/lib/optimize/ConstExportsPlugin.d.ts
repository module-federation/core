export = ConstExportsPlugin;
declare class ConstExportsPlugin {
    /**
     * @param {ConstValueParserPluginOptions} options plugin options
     */
    constructor(options: ConstValueParserPluginOptions);
    /** @type {ConstValueParserPluginOptions} */
    options: ConstValueParserPluginOptions;
    /**
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ConstExportsPlugin {
    export { CONST_BINDING_TAG, ConstValueParserPluginOptions };
}
import type Compiler from "../Compiler";
declare const CONST_BINDING_TAG: unique symbol;
type ConstValueParserPluginOptions = {
    inlineExports: boolean;
};
