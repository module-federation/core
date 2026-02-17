export = Template;
/**
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
 * @typedef {object} RenderManifestEntryTemplated
 * @property {() => Source} render
 * @property {TemplatePath} filenameTemplate
 * @property {PathData=} pathOptions
 * @property {AssetInfo=} info
 * @property {string} identifier
 * @property {string=} hash
 * @property {boolean=} auxiliary
 */
/**
 * @typedef {object} RenderManifestEntryStatic
 * @property {() => Source} render
 * @property {string} filename
 * @property {AssetInfo} info
 * @property {string} identifier
 * @property {string=} hash
 * @property {boolean=} auxiliary
 */
/**
 * @typedef {(module: Module) => boolean} ModuleFilterPredicate
 */
declare class Template {
    /**
     * @template {EXPECTED_FUNCTION} T
     * @param {T} fn a runtime function (.runtime.js) "template"
     * @returns {string} the updated and normalized function string
     */
    static getFunctionContent<T extends EXPECTED_FUNCTION>(fn: T): string;
    /**
     * @param {string} str the string converted to identifier
     * @returns {string} created identifier
     */
    static toIdentifier(str: string): string;
    /**
     * @param {string} str string to be converted to commented in bundle code
     * @returns {string} returns a commented version of string
     */
    static toComment(str: string): string;
    /**
     * @param {string} str string to be converted to "normal comment"
     * @returns {string} returns a commented version of string
     */
    static toNormalComment(str: string): string;
    /**
     * @param {string} str string path to be normalized
     * @returns {string} normalized bundle-safe path
     */
    static toPath(str: string): string;
    /**
     * @param {number} n number to convert to ident
     * @returns {string} returns single character ident
     */
    static numberToIdentifier(n: number): string;
    /**
     * @param {number} n number to convert to ident
     * @returns {string} returns single character ident
     */
    static numberToIdentifierContinuation(n: number): string;
    /**
     * @param {string | string[]} s string to convert to identity
     * @returns {string} converted identity
     */
    static indent(s: string | string[]): string;
    /**
     * @param {string | string[]} s string to create prefix for
     * @param {string} prefix prefix to compose
     * @returns {string} returns new prefix string
     */
    static prefix(s: string | string[], prefix: string): string;
    /**
     * @param {string | string[]} str string or string collection
     * @returns {string} returns a single string from array
     */
    static asString(str: string | string[]): string;
    /**
     * @typedef {object} WithId
     * @property {string | number} id
     */
    /**
     * @param {WithId[]} modules a collection of modules to get array bounds for
     * @returns {[number, number] | false} returns the upper and lower array bounds
     * or false if not every module has a number based id
     */
    static getModulesArrayBounds(modules: {
        id: string | number;
    }[]): [number, number] | false;
    /**
     * @param {ChunkRenderContext} renderContext render context
     * @param {Module[]} modules modules to render (should be ordered by identifier)
     * @param {(module: Module, renderInArray?: boolean) => Source | null} renderModule function to render a module
     * @param {string=} prefix applying prefix strings
     * @returns {Source | null} rendered chunk modules in a Source object or null if no modules
     */
    static renderChunkModules(renderContext: ChunkRenderContext, modules: Module[], renderModule: (module: Module, renderInArray?: boolean) => Source | null, prefix?: string | undefined): Source | null;
    /**
     * @param {RuntimeModule[]} runtimeModules array of runtime modules in order
     * @param {RenderContext & { codeGenerationResults?: CodeGenerationResults }} renderContext render context
     * @returns {Source} rendered runtime modules in a Source object
     */
    static renderRuntimeModules(runtimeModules: RuntimeModule[], renderContext: RenderContext & {
        codeGenerationResults?: CodeGenerationResults;
    }): Source;
    /**
     * @param {RuntimeModule[]} runtimeModules array of runtime modules in order
     * @param {RenderContext} renderContext render context
     * @returns {Source} rendered chunk runtime modules in a Source object
     */
    static renderChunkRuntimeModules(runtimeModules: RuntimeModule[], renderContext: RenderContext): Source;
}
declare namespace Template {
    export { NUMBER_OF_IDENTIFIER_CONTINUATION_CHARS, NUMBER_OF_IDENTIFIER_START_CHARS, Source, OutputOptions, Chunk, ChunkGraph, ModuleId, CodeGenerationResults, AssetInfo, PathData, DependencyTemplates, Module, ModuleGraph, ModuleTemplate, RuntimeModule, RuntimeTemplate, TemplatePath, ChunkRenderContext, RenderContext, RenderManifestOptions, RenderManifestEntry, RenderManifestEntryTemplated, RenderManifestEntryStatic, ModuleFilterPredicate };
}
declare const NUMBER_OF_IDENTIFIER_CONTINUATION_CHARS: number;
declare const NUMBER_OF_IDENTIFIER_START_CHARS: number;
type Source = import("webpack-sources").Source;
type OutputOptions = import("./config/defaults").OutputNormalizedWithDefaults;
type Chunk = import("./Chunk");
type ChunkGraph = import("./ChunkGraph");
type ModuleId = import("./ChunkGraph").ModuleId;
type CodeGenerationResults = import("./CodeGenerationResults");
type AssetInfo = import("./Compilation").AssetInfo;
type PathData = import("./Compilation").PathData;
type DependencyTemplates = import("./DependencyTemplates");
type Module = import("./Module");
type ModuleGraph = import("./ModuleGraph");
type ModuleTemplate = import("./ModuleTemplate");
type RuntimeModule = import("./RuntimeModule");
type RuntimeTemplate = import("./RuntimeTemplate");
type TemplatePath = import("./TemplatedPathPlugin").TemplatePath;
type ChunkRenderContext = import("./javascript/JavascriptModulesPlugin").ChunkRenderContext;
type RenderContext = import("./javascript/JavascriptModulesPlugin").RenderContext;
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
type RenderManifestEntryTemplated = {
    render: () => Source;
    filenameTemplate: TemplatePath;
    pathOptions?: PathData | undefined;
    info?: AssetInfo | undefined;
    identifier: string;
    hash?: string | undefined;
    auxiliary?: boolean | undefined;
};
type RenderManifestEntryStatic = {
    render: () => Source;
    filename: string;
    info: AssetInfo;
    identifier: string;
    hash?: string | undefined;
    auxiliary?: boolean | undefined;
};
type ModuleFilterPredicate = (module: Module) => boolean;
