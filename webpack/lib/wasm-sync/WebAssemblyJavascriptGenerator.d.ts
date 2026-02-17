export = WebAssemblyJavascriptGenerator;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Generator").GenerateContext} GenerateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").SourceType} SourceType */
/** @typedef {import("../Module").SourceTypes} SourceTypes */
/** @typedef {import("../NormalModule")} NormalModule */
declare class WebAssemblyJavascriptGenerator extends Generator {
    /**
     * @param {Error} error the error
     * @param {NormalModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: NormalModule, generateContext: GenerateContext): Source | null;
}
declare namespace WebAssemblyJavascriptGenerator {
    export { Source, GenerateContext, Module, SourceType, SourceTypes, NormalModule };
}
import Generator = require("../Generator");
type Source = import("webpack-sources").Source;
type GenerateContext = import("../Generator").GenerateContext;
type Module = import("../Module");
type SourceType = import("../Module").SourceType;
type SourceTypes = import("../Module").SourceTypes;
type NormalModule = import("../NormalModule");
