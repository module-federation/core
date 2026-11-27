export = JavascriptGenerator;
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {JavascriptNormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class JavascriptGenerator extends Generator<JavascriptNormalModule> {
    constructor();
    /**
     * Processes the provided dependency.
     * @param {Dependency} dependency the dependency to generate
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the template context shared for the whole module
     * @param {GenerateContext} generateContext the render context
     * @returns {void}
     */
    sourceDependency(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplate.DependencyTemplateContext, generateContext: Generator.GenerateContext): void;
    /**
     * Processes the provided dependencies block.
     * @param {Module} module the module to generate
     * @param {DependenciesBlock} block the dependencies block which will be processed
     * @param {DependencyTemplateContext} templateContext the template context shared for the whole module
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {GenerateContext} generateContext the generateContext
     * @returns {void}
     */
    sourceBlock(module: Module, block: DependenciesBlock, templateContext: DependencyTemplate.DependencyTemplateContext, source: ReplaceSource, generateContext: Generator.GenerateContext): void;
    /**
     * Processes the provided module.
     * @param {Module} module the module to generate
     * @param {InitFragment<GenerateContext>[]} initFragments mutable list of init fragments
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {GenerateContext} generateContext the generateContext
     * @returns {void}
     */
    sourceModule(module: Module, initFragments: InitFragment<Generator.GenerateContext>[], source: ReplaceSource, generateContext: Generator.GenerateContext): void;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
}
declare namespace JavascriptGenerator {
    export { TModule };
}
import type { JavascriptNormalModule } from "./JavascriptModule";
import Generator = require("../module/Generator");
import type Dependency from "../graph/Dependency";
import { ReplaceSource } from "webpack-sources";
import type DependencyTemplate from "../template/DependencyTemplate";
import type Module from "../module/Module";
import type DependenciesBlock from "../graph/DependenciesBlock";
import InitFragment = require("../template/InitFragment");
import type { Source } from "webpack-sources";
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = JavascriptNormalModule;
