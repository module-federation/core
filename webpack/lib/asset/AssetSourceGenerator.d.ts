export = AssetSourceGenerator;
/** @import { AssetNormalModule } from "./AssetModule" */
/** @import { Source } from "webpack-sources" */
/** @import { GenerateContext, UpdateHashContext } from "../module/Generator" */
/** @import Hash from "../util/Hash" */
/**
 * @import {
 * 	ConcatenationBailoutReasonContext,
 * 	SourceType,
 * 	SourceTypes
 * } from "../module/Module"
 */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {AssetNormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class AssetSourceGenerator extends Generator<AssetNormalModule> {
    /**
     * Offer the file's text to `renderEmbeddedSource` before it is embedded in
     * JavaScript. Declines a file whose name names no language webpack knows.
     * @param {TModule} module the module holding the text
     * @param {string} text the file's text
     * @param {GenerateContext["runtimeTemplate"]} runtimeTemplate runtime template
     * @returns {string} the rendered text, or `text` when nothing rendered it
     */
    static _renderEmbedded(module: TModule, text: string, runtimeTemplate: Generator.GenerateContext["runtimeTemplate"]): string;
    /**
     * Creates an instance of AssetSourceGenerator.
     * @param {ModuleGraph} moduleGraph the module graph
     */
    constructor(moduleGraph: ModuleGraph);
    /** @type {ModuleGraph} */
    _moduleGraph: ModuleGraph;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
}
declare namespace AssetSourceGenerator {
    export { TModule };
}
import type { AssetNormalModule } from "./AssetModule";
import Generator = require("../module/Generator");
import type ModuleGraph from "../graph/ModuleGraph";
import type { Source } from "webpack-sources";
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = AssetNormalModule;
