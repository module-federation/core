export = JavascriptModulesPlugin;
/** @typedef {{ header: string[], beforeStartup: string[], startup: string[], afterStartup: string[], allowInlineStartup: boolean }} Bootstrap */
declare class JavascriptModulesPlugin {
    /**
     * @param {Compilation} compilation the compilation
     * @returns {CompilationHooks} the attached hooks
     */
    static getCompilationHooks(compilation: Compilation): CompilationHooks;
    /**
     * @param {Chunk} chunk chunk
     * @param {OutputOptions} outputOptions output options
     * @returns {TemplatePath} used filename template
     */
    static getChunkFilenameTemplate(chunk: Chunk, outputOptions: OutputOptions): TemplatePath;
    constructor(options?: {});
    options: {};
    /** @type {WeakMap<Source, { source: Source, needModule:boolean, needExports: boolean, needRequire: boolean, needThisAsExports: boolean, needStrict: boolean | undefined, renderShorthand: boolean }>} */
    _moduleFactoryCache: WeakMap<Source, {
        source: Source;
        needModule: boolean;
        needExports: boolean;
        needRequire: boolean;
        needThisAsExports: boolean;
        needStrict: boolean | undefined;
        renderShorthand: boolean;
    }>;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * @param {Module} module the rendered module
     * @param {ModuleRenderContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {Source | null} the newly generated source from rendering
     */
    renderModule(module: Module, renderContext: ModuleRenderContext, hooks: CompilationHooks): Source | null;
    /**
     * @param {RenderContext} renderContext the render context
     * @param {CompilationHooks} hooks hooks
     * @returns {Source} the rendered source
     */
    renderChunk(renderContext: RenderContext, hooks: CompilationHooks): Source;
    /**
     * @param {MainRenderContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @param {Compilation} compilation the compilation
     * @returns {Source} the newly generated source from rendering
     */
    renderMain(renderContext: MainRenderContext, hooks: CompilationHooks, compilation: Compilation): Source;
    /**
     * @param {Hash} hash the hash to be updated
     * @param {RenderBootstrapContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     */
    updateHashWithBootstrap(hash: Hash, renderContext: RenderBootstrapContext, hooks: CompilationHooks): void;
    /**
     * @param {RenderBootstrapContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {Bootstrap} the generated source of the bootstrap code
     */
    renderBootstrap(renderContext: RenderBootstrapContext, hooks: CompilationHooks): Bootstrap;
    /**
     * @param {RenderBootstrapContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {string} the generated source of the require function
     */
    renderRequire(renderContext: RenderBootstrapContext, hooks: CompilationHooks): string;
    /**
     * @param {Compilation} compilation compilation
     * @param {Module[]} allModules allModules
     * @param {MainRenderContext} renderContext renderContext
     * @param {Set<Module>} inlinedModules inlinedModules
     * @param {ChunkRenderContext} chunkRenderContext chunkRenderContext
     * @param {CompilationHooks} hooks hooks
     * @param {boolean | undefined} allStrict allStrict
     * @param {boolean} hasChunkModules hasChunkModules
     * @returns {Map<Module, Source> | false} renamed inlined modules
     */
    _getRenamedInlineModule(compilation: Compilation, allModules: Module[], renderContext: MainRenderContext, inlinedModules: Set<Module>, chunkRenderContext: ChunkRenderContext, hooks: CompilationHooks, allStrict: boolean | undefined, hasChunkModules: boolean): Map<Module, Source> | false;
}
declare namespace JavascriptModulesPlugin {
    export { chunkHasJs, Reference, Scope, Variable, Program, Source, OutputOptions, Chunk, ChunkGraph, CodeGenerationResults, ChunkHashContext, ExecuteModuleObject, Compiler, DependencyTemplates, Entrypoint, Module, BuildInfo, ModuleGraph, RuntimeTemplate, TemplatePath, WebpackError, Range, Hash, RenderContext, MainRenderContext, ChunkRenderContext, RenderBootstrapContext, StartupRenderContext, ModuleRenderContext, CompilationHooks, Bootstrap };
}
import Compilation = require("../Compilation");
/** @typedef {import("eslint-scope").Reference} Reference */
/** @typedef {import("eslint-scope").Scope} Scope */
/** @typedef {import("eslint-scope").Variable} Variable */
/** @typedef {import("estree").Program} Program */
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../config/defaults").OutputNormalizedWithDefaults} OutputOptions */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../CodeGenerationResults")} CodeGenerationResults */
/** @typedef {import("../Compilation").ChunkHashContext} ChunkHashContext */
/** @typedef {import("../Compilation").ExecuteModuleObject} ExecuteModuleObject */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../DependencyTemplates")} DependencyTemplates */
/** @typedef {import("../Entrypoint")} Entrypoint */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").BuildInfo} BuildInfo */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("../TemplatedPathPlugin").TemplatePath} TemplatePath */
/** @typedef {import("../WebpackError")} WebpackError */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../util/Hash")} Hash */
/**
 * @param {Chunk} chunk a chunk
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @returns {boolean} true, when a JS file is needed for this chunk
 */
declare function chunkHasJs(chunk: Chunk, chunkGraph: ChunkGraph): boolean;
type Reference = import("eslint-scope").Reference;
type Scope = import("eslint-scope").Scope;
type Variable = import("eslint-scope").Variable;
type Program = import("estree").Program;
type Source = import("webpack-sources").Source;
type OutputOptions = import("../config/defaults").OutputNormalizedWithDefaults;
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type CodeGenerationResults = import("../CodeGenerationResults");
type ChunkHashContext = import("../Compilation").ChunkHashContext;
type ExecuteModuleObject = import("../Compilation").ExecuteModuleObject;
type Compiler = import("../Compiler");
type DependencyTemplates = import("../DependencyTemplates");
type Entrypoint = import("../Entrypoint");
type Module = import("../Module");
type BuildInfo = import("../Module").BuildInfo;
type ModuleGraph = import("../ModuleGraph");
type RuntimeTemplate = import("../RuntimeTemplate");
type TemplatePath = import("../TemplatedPathPlugin").TemplatePath;
type WebpackError = import("../WebpackError");
type Range = import("../javascript/JavascriptParser").Range;
type Hash = import("../util/Hash");
type RenderContext = {
    /**
     * the chunk
     */
    chunk: Chunk;
    /**
     * the dependency templates
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
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
    /**
     * rendering in strict context
     */
    strictMode: boolean | undefined;
};
type MainRenderContext = {
    /**
     * the chunk
     */
    chunk: Chunk;
    /**
     * the dependency templates
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
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
    /**
     * hash to be used for render call
     */
    hash: string;
    /**
     * rendering in strict context
     */
    strictMode: boolean | undefined;
};
type ChunkRenderContext = {
    /**
     * the chunk
     */
    chunk: Chunk;
    /**
     * the dependency templates
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
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
    /**
     * init fragments for the chunk
     */
    chunkInitFragments: InitFragment<ChunkRenderContext>[];
    /**
     * rendering in strict context
     */
    strictMode: boolean | undefined;
};
type RenderBootstrapContext = {
    /**
     * the chunk
     */
    chunk: Chunk;
    /**
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
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
     * hash to be used for render call
     */
    hash: string;
};
type StartupRenderContext = {
    /**
     * the chunk
     */
    chunk: Chunk;
    /**
     * the dependency templates
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
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
    /**
     * rendering in strict context
     */
    strictMode: boolean | undefined;
    /**
     * inlined
     */
    inlined: boolean;
    /**
     * the inlined entry module is wrapped in an IIFE
     */
    inlinedInIIFE?: boolean | undefined;
};
type ModuleRenderContext = {
    /**
     * the chunk
     */
    chunk: Chunk;
    /**
     * the dependency templates
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
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
    /**
     * init fragments for the chunk
     */
    chunkInitFragments: InitFragment<ChunkRenderContext>[];
    /**
     * rendering in strict context
     */
    strictMode: boolean | undefined;
    /**
     * true: renders as factory method, false: pure module content
     */
    factory: boolean;
    /**
     * the inlined entry module is wrapped in an IIFE, existing only when `factory` is set to false
     */
    inlinedInIIFE?: boolean | undefined;
    /**
     * render module in object container
     */
    renderInObject?: boolean | undefined;
};
type CompilationHooks = {
    renderModuleContent: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    renderModuleContainer: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    renderModulePackage: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    renderChunk: SyncWaterfallHook<[Source, RenderContext]>;
    renderMain: SyncWaterfallHook<[Source, RenderContext]>;
    renderContent: SyncWaterfallHook<[Source, RenderContext]>;
    render: SyncWaterfallHook<[Source, RenderContext]>;
    renderStartup: SyncWaterfallHook<[Source, Module, StartupRenderContext]>;
    renderRequire: SyncWaterfallHook<[string, RenderBootstrapContext]>;
    inlineInRuntimeBailout: SyncBailHook<[Module, Partial<RenderBootstrapContext>], string | void>;
    embedInRuntimeBailout: SyncBailHook<[Module, RenderContext], string | void>;
    strictRuntimeBailout: SyncBailHook<[RenderContext], string | void>;
    chunkHash: SyncHook<[Chunk, Hash, ChunkHashContext]>;
    useSourceMap: SyncBailHook<[Chunk, RenderContext], boolean | void>;
};
type Bootstrap = {
    header: string[];
    beforeStartup: string[];
    startup: string[];
    afterStartup: string[];
    allowInlineStartup: boolean;
};
import InitFragment = require("../InitFragment");
import { SyncWaterfallHook } from "tapable";
import { SyncBailHook } from "tapable";
import { SyncHook } from "tapable";
