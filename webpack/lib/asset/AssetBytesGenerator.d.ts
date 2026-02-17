export = AssetSourceGenerator;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Generator").GenerateContext} GenerateContext */
/** @typedef {import("../Module").ConcatenationBailoutReasonContext} ConcatenationBailoutReasonContext */
/** @typedef {import("../Module").SourceType} SourceType */
/** @typedef {import("../Module").SourceTypes} SourceTypes */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../NormalModule")} NormalModule */
declare class AssetSourceGenerator extends Generator {
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     */
    constructor(moduleGraph: ModuleGraph);
    _moduleGraph: import("../ModuleGraph");
    /**
     * @param {Error} error the error
     * @param {NormalModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: NormalModule, generateContext: GenerateContext): Source | null;
}
declare namespace AssetSourceGenerator {
    export { Source, GenerateContext, ConcatenationBailoutReasonContext, SourceType, SourceTypes, ModuleGraph, NormalModule };
}
import Generator = require("../Generator");
type Source = import("webpack-sources").Source;
type GenerateContext = import("../Generator").GenerateContext;
type ConcatenationBailoutReasonContext = import("../Module").ConcatenationBailoutReasonContext;
type SourceType = import("../Module").SourceType;
type SourceTypes = import("../Module").SourceTypes;
type ModuleGraph = import("../ModuleGraph");
type NormalModule = import("../NormalModule");
