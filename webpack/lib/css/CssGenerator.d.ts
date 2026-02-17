export = CssGenerator;
declare class CssGenerator extends Generator {
    /**
     * @param {CssModuleGeneratorOptions} options options
     * @param {ModuleGraph} moduleGraph the module graph
     */
    constructor(options: CssModuleGeneratorOptions, moduleGraph: ModuleGraph);
    options: import("../../declarations/WebpackOptions").CssModuleGeneratorOptions;
    _exportsOnly: boolean;
    _esModule: boolean;
    _moduleGraph: import("../ModuleGraph");
    /** @type {WeakMap<Source, ModuleFactoryCacheEntry>} */
    _moduleFactoryCache: WeakMap<Source, ModuleFactoryCacheEntry>;
    /**
     * Generate JavaScript code that requires and concatenates all CSS imports
     * @param {NormalModule} module the module to generate CSS text for
     * @param {GenerateContext} generateContext the generate context
     * @returns {{ expr: string, type: CssParserExportType }[]} JavaScript code that concatenates all imported CSS
     */
    _generateImportCode(module: NormalModule, generateContext: GenerateContext): {
        expr: string;
        type: CssParserExportType;
    }[];
    /**
     * Generate CSS code for the current module
     * @param {NormalModule} module the module to generate CSS code for
     * @param {GenerateContext} generateContext the generate context
     * @returns {string} the CSS code as string
     */
    _generateModuleCode(module: NormalModule, generateContext: GenerateContext): string;
    /**
     * @param {NormalModule} module the current module
     * @param {Dependency} dependency the dependency to generate
     * @param {InitFragment<GenerateContext>[]} initFragments mutable list of init fragments
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {GenerateContext & { cssData: CssData }} generateContext the render context
     * @returns {void}
     */
    sourceDependency(module: NormalModule, dependency: Dependency, initFragments: InitFragment<GenerateContext>[], source: ReplaceSource, generateContext: GenerateContext & {
        cssData: CssData;
    }): void;
    /**
     * @param {NormalModule} module the module to generate
     * @param {InitFragment<GenerateContext>[]} initFragments mutable list of init fragments
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {GenerateContext & { cssData: CssData }} generateContext the generateContext
     * @returns {void}
     */
    sourceModule(module: NormalModule, initFragments: InitFragment<GenerateContext>[], source: ReplaceSource, generateContext: GenerateContext & {
        cssData: CssData;
    }): void;
    /**
     * @param {Error} error the error
     * @param {NormalModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: NormalModule, generateContext: GenerateContext): Source | null;
    /**
     * @param {NormalModule} module module
     * @returns {boolean} true if the module only outputs JavaScript
     */
    _generatesJsOnly(module: NormalModule): boolean;
}
declare namespace CssGenerator {
    export { Source, CssModuleGeneratorOptions, DependencyConstructor, CodeGenerationResults, Dependency, CssData, DependencyTemplateContext, GenerateContext, UpdateHashContext, BuildInfo, BuildMeta, ConcatenationBailoutReasonContext, SourceType, SourceTypes, ModuleGraph, NormalModule, Hash, ModuleFactoryCacheEntry, CssModule, Compilation, RuntimeRequirements, CssParserExportType };
}
import Generator = require("../Generator");
import InitFragment = require("../InitFragment");
import { ReplaceSource } from "webpack-sources";
type Source = import("webpack-sources").Source;
type CssModuleGeneratorOptions = import("../../declarations/WebpackOptions").CssModuleGeneratorOptions;
type DependencyConstructor = import("../Compilation").DependencyConstructor;
type CodeGenerationResults = import("../CodeGenerationResults");
type Dependency = import("../Dependency");
type CssData = import("../DependencyTemplate").CssData;
type DependencyTemplateContext = import("../DependencyTemplate").CssDependencyTemplateContext;
type GenerateContext = import("../Generator").GenerateContext;
type UpdateHashContext = import("../Generator").UpdateHashContext;
type BuildInfo = import("../Module").BuildInfo;
type BuildMeta = import("../Module").BuildMeta;
type ConcatenationBailoutReasonContext = import("../Module").ConcatenationBailoutReasonContext;
type SourceType = import("../Module").SourceType;
type SourceTypes = import("../Module").SourceTypes;
type ModuleGraph = import("../ModuleGraph");
type NormalModule = import("../NormalModule");
type Hash = import("../util/Hash");
type ModuleFactoryCacheEntry = import("./CssModulesPlugin").ModuleFactoryCacheEntry;
type CssModule = import("../CssModule");
type Compilation = import("../Compilation");
type RuntimeRequirements = import("../Module").RuntimeRequirements;
type CssParserExportType = import("../../declarations/WebpackOptions").CssParserExportType;
