export = AsyncWebAssemblyGenerator;
/** @import { Source } from "webpack-sources" */
/** @import { GenerateContext } from "../module/Generator" */
/** @import { SourceType, SourceTypes } from "../module/Module" */
/** @import NormalModule from "../module/NormalModule" */
/**
 * Represents the async web assembly generator runtime component.
 * @typedef {object} AsyncWebAssemblyGeneratorOptions
 * @property {boolean=} mangleImports mangle imports
 */
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {NormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class AsyncWebAssemblyGenerator extends Generator<NormalModule> {
    /**
     * Creates an instance of AsyncWebAssemblyGenerator.
     * @param {AsyncWebAssemblyGeneratorOptions} options options
     */
    constructor(options: AsyncWebAssemblyGeneratorOptions);
    /** @type {AsyncWebAssemblyGeneratorOptions} */
    options: AsyncWebAssemblyGeneratorOptions;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
}
declare namespace AsyncWebAssemblyGenerator {
    export { AsyncWebAssemblyGeneratorOptions, TModule };
}
import type NormalModule from "../module/NormalModule";
import Generator = require("../module/Generator");
import type { Source } from "webpack-sources";
/**
 * Represents the async web assembly generator runtime component.
 */
type AsyncWebAssemblyGeneratorOptions = {
    /**
     * mangle imports
     */
    mangleImports?: boolean | undefined;
};
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = NormalModule;
