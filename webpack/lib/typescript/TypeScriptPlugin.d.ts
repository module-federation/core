export = TypeScriptPlugin;
declare class TypeScriptPlugin {
    /**
     * @param {Compiler} compiler webpack compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * processResult tap body. Returns the input untouched unless this is a
     * TypeScript module that needs to be transformed.
     * @param {Result} result loader result tuple
     * @param {NormalModuleType} module the normal module
     * @returns {Result} possibly transformed result
     */
    _processResult(result: NormalModule.Result, module: NormalModule): NormalModule.Result;
}
import type Compiler from "../Compiler";
import NormalModule = require("../module/NormalModule");
