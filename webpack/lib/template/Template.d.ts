export = Template;
/**
 * Defines the render manifest options type used by this module.
 * @typedef {object} RenderManifestOptions
 * @property {Chunk} chunk the chunk used to render
 * @property {string} hash
 * @property {string} fullHash
 * @property {OutputOptions} outputOptions
 * @property {CodeGenerationResults} codeGenerationResults
 * @property {{ javascript: ModuleTemplate }} moduleTemplates
 * @property {DependencyTemplates} dependencyTemplates
 * @property {RuntimeTemplate} runtimeTemplate
 * @property {ModuleGraph} moduleGraph
 * @property {ChunkGraph} chunkGraph
 */
/** @typedef {RenderManifestEntryTemplated | RenderManifestEntryStatic} RenderManifestEntry */
/**
 * Defines the render manifest entry templated type used by this module.
 * @typedef {object} RenderManifestEntryTemplated
 * @property {() => Source} render
 * @property {string | import("./TemplatedPathPlugin").TemplatePathFn<EXPECTED_ANY>} filenameTemplate
 * @property {PathData=} pathOptions
 * @property {AssetInfo=} info
 * @property {string} identifier
 * @property {string=} hash
 * @property {boolean=} auxiliary
 */
/**
 * Defines the render manifest entry static type used by this module.
 * @typedef {object} RenderManifestEntryStatic
 * @property {() => Source} render
 * @property {string} filename
 * @property {AssetInfo} info
 * @property {string} identifier
 * @property {string=} hash
 * @property {boolean=} auxiliary
 */
/**
 * Defines the module filter predicate type used by this module.
 * @typedef {(module: Module) => boolean} ModuleFilterPredicate
 */
/**
 * Represents the template runtime component.
 * @typedef {object} Stringable
 * @property {() => string} toString
 */
declare class Template {
    /**
     * Gets function content.
     * @param {Stringable} fn a runtime function (.runtime.js) "template"
     * @returns {string} the updated and normalized function string
     */
    static getFunctionContent(fn: Stringable): string;
    /**
     * Returns created identifier.
     * @param {string} str the string converted to identifier
     * @returns {string} created identifier
     */
    static toIdentifier(str: string): string;
    /**
     * Returns a commented version of string.
     * @param {string} str string to be converted to commented in bundle code
     * @returns {string} returns a commented version of string
     */
    static toComment(str: string): string;
    /**
     * Returns a commented version of string.
     * @param {string} str string to be converted to "normal comment"
     * @returns {string} returns a commented version of string
     */
    static toNormalComment(str: string): string;
    /**
     * Returns normalized bundle-safe path.
     * @param {string} str string path to be normalized
     * @returns {string} normalized bundle-safe path
     */
    static toPath(str: string): string;
    /**
     * Number to identifier.
     * @param {number} n number to convert to ident
     * @returns {string} returns single character ident
     */
    static numberToIdentifier(n: number): string;
    /**
     * Number to identifier continuation.
     * @param {number} n number to convert to ident
     * @returns {string} returns single character ident
     */
    static numberToIdentifierContinuation(n: number): string;
    /**
     * Returns converted identity.
     * @param {string | string[]} s string to convert to identity
     * @returns {string} converted identity
     */
    static indent(s: string | string[]): string;
    /**
     * Returns new prefix string.
     * @param {string | string[]} s string to create prefix for
     * @param {string} prefix prefix to compose
     * @returns {string} returns new prefix string
     */
    static prefix(s: string | string[], prefix: string): string;
    /**
     * Returns a single string from array.
     * @param {string | string[]} str string or string collection
     * @returns {string} returns a single string from array
     */
    static asString(str: string | string[]): string;
    /**
     * Defines the with id type used by this module.
     * @typedef {object} WithId
     * @property {string | number} id
     */
    /**
     * Gets modules array bounds.
     * @param {WithId[]} modules a collection of modules to get array bounds for
     * @returns {[number, number] | false} returns the upper and lower array bounds
     * or false if not every module has a number based id
     */
    static getModulesArrayBounds(modules: {
        id: string | number;
    }[]): [number, number] | false;
    /**
     * Renders chunk modules.
     * @param {ChunkRenderContext} renderContext render context
     * @param {Module[]} modules modules to render (should be ordered by identifier)
     * @param {(module: Module, renderInArray?: boolean) => Source | null} renderModule function to render a module
     * @param {string=} prefix applying prefix strings
     * @returns {Source | null} rendered chunk modules in a Source object or null if no modules
     */
    static renderChunkModules(renderContext: ChunkRenderContext, modules: Module[], renderModule: (module: Module, renderInArray?: boolean) => Source | null, prefix?: string | undefined): Source | null;
    /**
     * Renders runtime modules.
     * @param {RuntimeModule[]} runtimeModules array of runtime modules in order
     * @param {RenderContext & { codeGenerationResults?: CodeGenerationResults }} renderContext render context
     * @returns {Source} rendered runtime modules in a Source object
     */
    static renderRuntimeModules(runtimeModules: RuntimeModule[], renderContext: RenderContext & {
        codeGenerationResults?: CodeGenerationResults;
    }): Source;
    /**
     * Renders chunk runtime modules.
     * @param {RuntimeModule[]} runtimeModules array of runtime modules in order
     * @param {RenderContext} renderContext render context
     * @returns {Source} rendered chunk runtime modules in a Source object
     */
    static renderChunkRuntimeModules(runtimeModules: RuntimeModule[], renderContext: RenderContext): Source;
}
declare namespace Template {
    export { NUMBER_OF_IDENTIFIER_CONTINUATION_CHARS, NUMBER_OF_IDENTIFIER_START_CHARS, RenderManifestOptions, RenderManifestEntry, RenderManifestEntryTemplated, RenderManifestEntryStatic, ModuleFilterPredicate, Stringable };
}
import type { ChunkRenderContext } from "../javascript/JavascriptModulesPlugin";
import type Module from "../module/Module";
import type { Source } from "webpack-sources";
import type RuntimeModule from "../runtime/RuntimeModule";
import type { RenderContext } from "../javascript/JavascriptModulesPlugin";
import type CodeGenerationResults from "../module/CodeGenerationResults";
declare const NUMBER_OF_IDENTIFIER_CONTINUATION_CHARS: number;
declare const NUMBER_OF_IDENTIFIER_START_CHARS: number;
/**
 * Defines the render manifest options type used by this module.
 */
type RenderManifestOptions = {
    /**
     * the chunk used to render
     */
    chunk: Chunk;
    hash: string;
    fullHash: string;
    outputOptions: OutputOptions;
    codeGenerationResults: CodeGenerationResults;
    moduleTemplates: {
        javascript: ModuleTemplate;
    };
    dependencyTemplates: DependencyTemplates;
    runtimeTemplate: RuntimeTemplate;
    moduleGraph: ModuleGraph;
    chunkGraph: ChunkGraph;
};
type RenderManifestEntry = RenderManifestEntryTemplated | RenderManifestEntryStatic;
/**
 * Defines the render manifest entry templated type used by this module.
 */
type RenderManifestEntryTemplated = {
    render: () => Source;
    filenameTemplate: string | import("./TemplatedPathPlugin").TemplatePathFn<EXPECTED_ANY>;
    pathOptions?: PathData | undefined;
    info?: AssetInfo | undefined;
    identifier: string;
    hash?: string | undefined;
    auxiliary?: boolean | undefined;
};
/**
 * Defines the render manifest entry static type used by this module.
 */
type RenderManifestEntryStatic = {
    render: () => Source;
    filename: string;
    info: AssetInfo;
    identifier: string;
    hash?: string | undefined;
    auxiliary?: boolean | undefined;
};
/**
 * Defines the module filter predicate type used by this module.
 */
type ModuleFilterPredicate = (module: Module) => boolean;
/**
 * Represents the template runtime component.
 */
type Stringable = {
    toString: () => string;
};
import type Chunk from "../graph/Chunk";
import type { OutputNormalizedWithDefaults as OutputOptions } from "../config/defaults";
import type ModuleTemplate from "./ModuleTemplate";
import type DependencyTemplates from "./DependencyTemplates";
import type RuntimeTemplate from "./RuntimeTemplate";
import type ModuleGraph from "../graph/ModuleGraph";
import type ChunkGraph from "../graph/ChunkGraph";
import type { PathData } from "../Compilation";
import type { AssetInfo } from "../Compilation";
