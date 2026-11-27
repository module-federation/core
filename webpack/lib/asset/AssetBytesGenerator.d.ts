export = AssetBytesGenerator;
/** @import { AssetNormalModule } from "./AssetModule" */
/** @import { Source } from "webpack-sources" */
/** @import { GenerateContext } from "../module/Generator" */
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
declare class AssetBytesGenerator extends Generator<AssetNormalModule> {
    /**
     * Creates an instance of AssetBytesGenerator.
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
declare namespace AssetBytesGenerator {
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
