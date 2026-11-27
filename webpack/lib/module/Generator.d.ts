export = Generator;
/**
 * @template {NormalModule} [TModule=NormalModule] the module class this generator generates
 */
declare class Generator<TModule extends NormalModule = NormalModule> {
    /**
     * Returns generator by type.
     * @param {{ [key in SourceType]?: Generator }} map map of types
     * @returns {ByTypeGenerator} generator by type
     */
    static byType(map: { [key in SourceType]?: Generator; }): ByTypeGenerator;
    /**
     * Returns what a module that failed to build says about it in the output.
     * The stack it carries is written relative to the context, keeping a
     * position only where a second build names the same one.
     * @param {Error} error the build error
     * @param {RequestShortener=} requestShortener request shortener, absolute paths are kept without one
     * @returns {string} message to emit
     */
    static buildErrorMessage(error: Error, requestShortener?: RequestShortener | undefined): string;
    /**
     * Returns the statement a module that failed to build throws when executed.
     * @param {Error} error the build error
     * @param {string=} parseErrorConstructor constructor for a rejected source, defaults to `SyntaxError` (WebAssembly rejects with `WebAssembly.CompileError` instead)
     * @param {RequestShortener=} requestShortener request shortener for the stack the message carries
     * @returns {string} javascript statement
     */
    static throwBuildErrorCode(error: Error, parseErrorConstructor?: string | undefined, requestShortener?: RequestShortener | undefined): string;
    /**
     * Returns the source types available for this module.
     * @abstract
     * @param {TModule} module fresh module
     * @returns {SourceTypes} available types (do not mutate)
     */
    getTypes(module: TModule): SourceTypes;
    /**
     * @returns {boolean} whether getTypes() depends on the module's incoming connections
     */
    getTypesDependOnIncomingConnections(): boolean;
    /**
     * Returns the estimated size for the requested source type.
     * @abstract
     * @param {TModule} module the module
     * @param {SourceType=} type source type
     * @returns {number} estimate size of the module
     */
    getSize(module: TModule, type?: SourceType | undefined): number;
    /**
     * Generates generated code for this runtime module.
     * @abstract
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generate(module: TModule, { dependencyTemplates, runtimeTemplate, moduleGraph, type }: GenerateContext): Source | null;
    /**
     * Returns the reason this module cannot be concatenated, when one exists.
     * @param {TModule} module module for which the bailout reason should be determined
     * @param {ConcatenationBailoutReasonContext} context context
     * @returns {string | undefined} reason why this module can't be concatenated, undefined when it can be concatenated
     */
    getConcatenationBailoutReason(module: TModule, context: ConcatenationBailoutReasonContext): string | undefined;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash hash that will be modified
     * @param {UpdateHashContext<TModule>} updateHashContext context for updating hash
     */
    updateHash(hash: Hash, { module, runtime }: UpdateHashContext<TModule>): void;
}
declare namespace Generator {
    export { GenerateContext, GenerateErrorFn, UpdateHashContext };
}
import type NormalModule from "./NormalModule";
import type { SourceTypes } from "./Module";
import type { SourceType } from "./Module";
import type { Source } from "webpack-sources";
import type { ConcatenationBailoutReasonContext } from "./Module";
import type Hash from "../util/Hash";
/**
 * @template {NormalModule} [TModule=NormalModule] the module class this generator generates
 * @extends {Generator<TModule>}
 */
declare class ByTypeGenerator<TModule extends NormalModule = NormalModule> extends Generator<TModule> {
    /**
     * Creates an instance of ByTypeGenerator.
     * @param {{ [key in SourceType]?: Generator }} map map of types
     */
    constructor(map: { [key in SourceType]?: Generator; });
    map: {
        [x: string]: Generator<NormalModule>;
    };
    /** @type {SourceTypes} */
    _types: SourceTypes;
    /** @type {GenerateErrorFn | undefined} */
    generateError: GenerateErrorFn | undefined;
}
import type RequestShortener from "../util/RequestShortener";
/**
 * Defines the generate context type used by this module.
 */
type GenerateContext = {
    /**
     * mapping from dependencies to templates
     */
    dependencyTemplates: DependencyTemplates;
    /**
     * the runtime template
     */
    runtimeTemplate: RuntimeTemplate;
    /**
     * the module graph
     */
    moduleGraph: ModuleGraph;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the requirements for runtime
     */
    runtimeRequirements: RuntimeRequirements;
    /**
     * the runtime
     */
    runtime: RuntimeSpec;
    /**
     * when in concatenated module, information about other concatenated modules
     */
    concatenationScope?: ConcatenationScope | undefined;
    /**
     * code generation results of other modules (need to have a codeGenerationDependency to use that)
     */
    codeGenerationResults?: CodeGenerationResults | undefined;
    /**
     * which kind of code should be generated
     */
    type: SourceType;
    /**
     * get access to the code generation data
     */
    getData?: (() => CodeGenerationResultData) | undefined;
};
/**
 * Defines the generate error fn callback.
 */
type GenerateErrorFn = (error: Error, module: NormalModule, generateContext: GenerateContext) => Source | null;
/**
 * Represents the generator runtime component.
 */
type UpdateHashContext<TModule extends NormalModule = NormalModule> = {
    /**
     * the module
     */
    module: TModule;
    chunkGraph: ChunkGraph;
    runtime: RuntimeSpec;
    runtimeTemplate?: RuntimeTemplate | undefined;
};
import type DependencyTemplates from "../template/DependencyTemplates";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type ModuleGraph from "../graph/ModuleGraph";
import type ChunkGraph from "../graph/ChunkGraph";
import type { RuntimeRequirements } from "./Module";
import type { RuntimeSpec } from "../util/runtime";
import type ConcatenationScope from "../optimize/ConcatenationScope";
import type CodeGenerationResults from "./CodeGenerationResults";
import type { CodeGenerationResultData } from "./Module";
