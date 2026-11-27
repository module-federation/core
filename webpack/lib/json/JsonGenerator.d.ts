export = JsonGenerator;
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {JsonNormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class JsonGenerator extends Generator<JsonNormalModule> {
    /**
     * Creates an instance of JsonGenerator.
     * @param {JsonGeneratorOptions} options options
     */
    constructor(options: JsonGeneratorOptions);
    /** @type {JsonGeneratorOptions} */
    options: JsonGeneratorOptions;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
}
declare namespace JsonGenerator {
    export { TModule };
}
import type { JsonNormalModule } from "./JsonModule";
import Generator = require("../module/Generator");
import type { JsonGeneratorOptions } from "../../declarations/WebpackOptions";
import type { Source } from "webpack-sources";
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = JsonNormalModule;
