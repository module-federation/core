export = CssGenerator;
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {CssNormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class CssGenerator extends Generator<CssModule.CssNormalModule> {
    /**
     * Creates an instance of CssGenerator.
     * @param {CssModuleGeneratorOptions} options options
     * @param {ModuleGraph} moduleGraph the module graph
     */
    constructor(options: CssModuleGeneratorOptions, moduleGraph: ModuleGraph);
    /** @type {CssModuleGeneratorOptions} */
    options: CssModuleGeneratorOptions;
    /** @type {boolean | undefined} */
    _exportsOnly: boolean | undefined;
    /** @type {boolean | undefined} */
    _esModule: boolean | undefined;
    /** @type {ModuleGraph} */
    _moduleGraph: ModuleGraph;
    /** @type {WeakMap<Source, ModuleFactoryCacheEntry>} */
    _moduleFactoryCache: WeakMap<Source, CssModulesPlugin.ModuleFactoryCacheEntry>;
    /** @type {boolean} */
    _localIdentNeedsHash: boolean;
    /** @type {boolean} */
    _localIdentNeedsContentHash: boolean;
    /**
     * Processes the provided module.
     * @param {Dependency} dependency the dependency to generate
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext & { cssData: CssData, type: string }} templateContext the template context (shared across all dependencies of the module)
     * @returns {void}
     */
    sourceDependency(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext & {
        cssData: CssData;
        type: string;
    }): void;
    /**
     * Processes the provided module.
     * @param {TModule} module the module to generate
     * @param {InitFragment<GenerateContext>[]} initFragments mutable list of init fragments
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {GenerateContext & { cssData: CssData }} generateContext the generateContext
     * @returns {void}
     */
    sourceModule(module: TModule, initFragments: InitFragment<Generator.GenerateContext>[], source: ReplaceSource, generateContext: Generator.GenerateContext & {
        cssData: CssData;
    }): void;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
    /**
     * Resolve the effective `@charset` by walking text imports.
     * @param {TModule} module the module
     * @param {ModuleGraph} moduleGraph module graph
     * @param {WeakSet<NormalModule>=} visited cycle guard
     * @returns {string | undefined} the effective charset
     */
    _getEffectiveCharset(module: TModule, moduleGraph: ModuleGraph, visited?: WeakSet<NormalModule> | undefined): string | undefined;
    /**
     * Generate JS expressions for `@import` side effects (`style` exportType only).
     * @param {TModule} module the module to generate CSS text for
     * @param {GenerateContext} generateContext the generate context
     * @returns {string[]} JS expressions, one per `@import` dependency
     */
    _generateImportExpressions(module: TModule, generateContext: Generator.GenerateContext): string[];
    /**
     * Recursively merge `@import`'d CSS into a single Source (text/css-style-sheet only).
     * @param {TModule} module the module to render
     * @param {GenerateContext} generateContext the generate context
     * @param {Set<NormalModule>} ancestors modules on the current path (cycle guard)
     * @returns {Source | null} merged CSS source, or null when the module has no content
     */
    _renderMergedCss(module: TModule, generateContext: Generator.GenerateContext, ancestors: Set<NormalModule>): Source | null;
    /**
     * Generate CSS source for the current module
     * @param {TModule} module the module to generate CSS source for
     * @param {GenerateContext} generateContext the generate context
     * @returns {Source | null} the CSS source
     */
    _renderCss(module: TModule, generateContext: Generator.GenerateContext): Source | null;
    /**
     * Applies the devtool filename template to the sources of a map that is inlined
     * into the module's own output: `SourceMapDevToolPlugin` only rewrites maps of
     * emitted assets, so this one would keep raw module identifiers.
     * @param {RawSourceMap} map the map to rename the sources of
     * @param {GenerateContext} generateContext the generate context
     * @returns {RawSourceMap} the map with devtool source names
     */
    _nameMapSources(map: RawSourceMap, generateContext: Generator.GenerateContext): RawSourceMap;
    /**
     * Offer CSS bound for a JS string literal to `renderEmbeddedSource`. No `.css`
     * asset carries this text, so an asset-level minimizer never sees it.
     * @param {Source} cssSource the CSS source
     * @param {TModule} module the module
     * @param {GenerateContext} generateContext the generate context
     * @returns {Source} the source a tap returned, or the original
     */
    _renderEmbeddedSource(cssSource: Source, module: TModule, generateContext: Generator.GenerateContext): Source;
    /**
     * Convert a CSS Source into a JS string literal, splicing `__webpack_require__.h()` for `[fullhash]` placeholders.
     * @param {Source} cssSource the CSS source
     * @param {import("../../declarations/WebpackOptions").DevTool | undefined} devtool the devtool option
     * @param {GenerateContext} generateContext the generate context
     * @returns {Source} a Source representing a JS string literal
     */
    _cssToJsLiteral(cssSource: Source, devtool: import("../../declarations/WebpackOptions").DevTool | undefined, generateContext: Generator.GenerateContext): Source;
    /**
     * Generate the merged CSS text for a module, optionally wrapped as a
     * JS string literal for embedding in JavaScript output.
     * @param {TModule} module the module
     * @param {GenerateContext} generateContext the generate context
     * @param {boolean} asJsLiteral wrap the result as a JS string literal
     * @returns {Source} the CSS text source
     */
    _generateCssText(module: TModule, generateContext: Generator.GenerateContext, asJsLiteral: boolean): Source;
}
declare namespace CssGenerator {
    export { SourcePosition, ExportLocsMap, TModule };
}
import type CssModule from "./CssModule";
import Generator = require("../module/Generator");
import type { CssModuleGeneratorOptions } from "../../declarations/WebpackOptions";
import type ModuleGraph from "../graph/ModuleGraph";
import type { Source } from "webpack-sources";
import CssModulesPlugin = require("./CssModulesPlugin");
import type Dependency from "../graph/Dependency";
import { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../template/DependencyTemplate";
import type { CssData } from "../template/DependencyTemplate";
import InitFragment = require("../template/InitFragment");
import type NormalModule from "../module/NormalModule";
import type { RawSourceMap } from "webpack-sources";
type SourcePosition = {
    line: number;
    column: number;
};
type ExportLocsMap = Map<string, SourcePosition>;
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = CssModule.CssNormalModule;
