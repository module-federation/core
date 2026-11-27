export = DependencyTemplate;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import CodeGenerationResults from "../module/CodeGenerationResults" */
/** @import ConcatenationScope from "../optimize/ConcatenationScope" */
/** @import Dependency from "../graph/Dependency" */
/** @import DependencyTemplates from "./DependencyTemplates" */
/** @import { GenerateContext } from "../module/Generator" */
/** @import Module, { CodeGenerationResultData, RuntimeRequirements } from "../module/Module" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import RuntimeTemplate from "./RuntimeTemplate" */
/** @import { RuntimeSpec } from "../util/runtime" */
/**
 * Defines the init fragment type used by this module.
 * @template T
 * @typedef {import("./InitFragment")<T>} InitFragment
 */
/**
 * Defines the dependency template context type used by this module.
 * @typedef {object} DependencyTemplateContext
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {DependencyTemplates} dependencyTemplates the dependency templates
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {RuntimeRequirements} runtimeRequirements the requirements for runtime
 * @property {Module} module current module
 * @property {RuntimeSpec} runtime current runtimes, for which code is generated
 * @property {InitFragment<GenerateContext>[]} initFragments mutable array of init fragments for the current module
 * @property {ConcatenationScope=} concatenationScope when in a concatenated module, information about other concatenated modules
 * @property {CodeGenerationResults} codeGenerationResults the code generation results
 * @property {InitFragment<import("../javascript/JavascriptModulesPlugin").ChunkRenderContext>[]} chunkInitFragments init fragments for the chunk, rendered with its render context
 * @property {(() => CodeGenerationResultData)=} getData get access to the code generation data
 */
/**
 * Defines the css dependency template context extras type used by this module.
 * @typedef {object} CssDependencyTemplateContextExtras
 * @property {CssData} cssData the css exports data
 * @property {string} type the css exports data
 */
/**
 * Defines the css data type used by this module.
 * @typedef {object} CssData
 * @property {boolean} esModule whether export __esModule
 * @property {Map<string, string>} exports the css exports
 * @property {Map<string, { line: number, column: number }>=} exportLocs source position (line is 1-based, column is 0-based) of each export's defining identifier in the original CSS, used to emit fine-grained JS-to-CSS source mappings
 */
/** @typedef {DependencyTemplateContext & CssDependencyTemplateContextExtras} CssDependencyTemplateContext */
declare class DependencyTemplate {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @abstract
     * @param {Dependency} dependency the dependency for which the template should be applied
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
}
declare namespace DependencyTemplate {
    export { InitFragment, DependencyTemplateContext, CssDependencyTemplateContextExtras, CssData, CssDependencyTemplateContext };
}
import type Dependency from "../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
/**
 * Defines the init fragment type used by this module.
 */
type InitFragment<T> = import("./InitFragment")<T>;
/**
 * Defines the dependency template context type used by this module.
 */
type DependencyTemplateContext = {
    /**
     * the runtime template
     */
    runtimeTemplate: RuntimeTemplate;
    /**
     * the dependency templates
     */
    dependencyTemplates: DependencyTemplates;
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
    runtimeRequirements: Module.RuntimeRequirements;
    /**
     * current module
     */
    module: Module;
    /**
     * current runtimes, for which code is generated
     */
    runtime: RuntimeSpec;
    /**
     * mutable array of init fragments for the current module
     */
    initFragments: InitFragment<GenerateContext>[];
    /**
     * when in a concatenated module, information about other concatenated modules
     */
    concatenationScope?: ConcatenationScope | undefined;
    /**
     * the code generation results
     */
    codeGenerationResults: CodeGenerationResults;
    /**
     * init fragments for the chunk, rendered with its render context
     */
    chunkInitFragments: InitFragment<import("../javascript/JavascriptModulesPlugin").ChunkRenderContext>[];
    /**
     * get access to the code generation data
     */
    getData?: (() => Module.CodeGenerationResultData) | undefined;
};
/**
 * Defines the css dependency template context extras type used by this module.
 */
type CssDependencyTemplateContextExtras = {
    /**
     * the css exports data
     */
    cssData: CssData;
    /**
     * the css exports data
     */
    type: string;
};
/**
 * Defines the css data type used by this module.
 */
type CssData = {
    /**
     * whether export __esModule
     */
    esModule: boolean;
    /**
     * the css exports
     */
    exports: Map<string, string>;
    /**
     * source position (line is 1-based, column is 0-based) of each export's defining identifier in the original CSS, used to emit fine-grained JS-to-CSS source mappings
     */
    exportLocs?: Map<string, {
        line: number;
        column: number;
    }> | undefined;
};
type CssDependencyTemplateContext = DependencyTemplateContext & CssDependencyTemplateContextExtras;
import type RuntimeTemplate from "./RuntimeTemplate";
import type DependencyTemplates from "./DependencyTemplates";
import type ModuleGraph from "../graph/ModuleGraph";
import type ChunkGraph from "../graph/ChunkGraph";
import type Module from "../module/Module";
import type { RuntimeSpec } from "../util/runtime";
import type { GenerateContext } from "../module/Generator";
import type ConcatenationScope from "../optimize/ConcatenationScope";
import type CodeGenerationResults from "../module/CodeGenerationResults";
