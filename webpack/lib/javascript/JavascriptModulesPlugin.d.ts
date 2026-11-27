export = JavascriptModulesPlugin;
/** @typedef {{ header: string[], beforeStartup: string[], startup: string[], afterStartup: string[], allowInlineStartup: boolean, exportsAwaited: boolean }} Bootstrap */
/** @typedef {{ source: Source, needModule: boolean, needExports: boolean, needRequire: boolean, needThisAsExports: boolean, needStrict: boolean | undefined, renderShorthand: boolean, next: ModuleFactoryCacheEntry | undefined }} ModuleFactoryCacheEntry */
/**
 * @typedef {object} RenamedInlinedModules
 * @property {Map<Module, Source>} sources each inlined module's rendered source, renamed where it collided
 * @property {Map<Module, Map<string, string>>} renamedDeclarations each renamed module's declarations, original to new name
 */
declare class JavascriptModulesPlugin {
    /**
     * Gets chunk filename template.
     * @param {Chunk} chunk chunk
     * @param {OutputOptions} outputOptions output options
     * @returns {ChunkFilenameTemplate} used filename template
     */
    static getChunkFilenameTemplate(chunk: Chunk, outputOptions: OutputOptions): Chunk.ChunkFilenameTemplate;
    /**
     * Returns the chunk's single entry module when it can be inlined at the top
     * level of an ESM output chunk (instead of the module registry), which keeps
     * its exports as live ESM bindings. Only a self-contained ESM entry whose
     * top-level declarations can be lifted into the chunk scope qualifies;
     * otherwise `undefined` is returned and the registry path is used.
     *
     * Static so that a plugin can decide before the chunk is rendered what it may
     * leave out of the inlined entry's source and put back in the registry.
     * @param {Pick<RenderContext, "chunk" | "chunkGraph" | "moduleGraph" | "runtimeTemplate" | "codeGenerationResults">} context chunk, graphs and code generation results
     * @returns {Module | undefined} the entry module to inline, if any
     */
    static _getEsmEntryModuleToInline(context: Pick<RenderContext, "chunk" | "chunkGraph" | "moduleGraph" | "runtimeTemplate" | "codeGenerationResults">): Module | undefined;
    constructor(options?: {});
    options: {};
    /** @type {WeakMap<Source, ModuleFactoryCacheEntry>} */
    _moduleFactoryCache: WeakMap<Source, ModuleFactoryCacheEntry>;
    /** @type {WeakMap<Source, Set<string>>} */
    _renderedFreeNamesCache: WeakMap<Source, Set<string>>;
    /** @type {WeakMap<CodeGenerationResults, Set<Source>>} */
    _renderedModuleFactorySources: WeakMap<CodeGenerationResults, Set<Source>>;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Releases the flattened text the module factory sources memoized while the
     * chunk assets were read. Clearing is only a hint, so a later read re-renders.
     * @param {Compilation} compilation the compilation that emitted its assets
     * @returns {void}
     */
    _releaseRenderedModuleFactorySources(compilation: Compilation): void;
    /**
     * Renders the newly generated source from rendering.
     * @param {Module} module the rendered module
     * @param {ModuleRenderContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {Source | null} the newly generated source from rendering
     */
    renderModule(module: Module, renderContext: ModuleRenderContext, hooks: CompilationHooks): Source | null;
    /**
     * Renders the rendered source.
     * @param {RenderContext} renderContext the render context
     * @param {CompilationHooks} hooks hooks
     * @returns {Source} the rendered source
     */
    renderChunk(renderContext: RenderContext, hooks: CompilationHooks): Source;
    /**
     * Renders the newly generated source from rendering.
     * @param {MainRenderContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @param {Compilation} compilation the compilation
     * @returns {Source} the newly generated source from rendering
     */
    renderMain(renderContext: MainRenderContext, hooks: CompilationHooks, compilation: Compilation): Source;
    /**
     * Updates hash with bootstrap.
     * @param {Hash} hash the hash to be updated
     * @param {RenderBootstrapContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     */
    updateHashWithBootstrap(hash: Hash, renderContext: RenderBootstrapContext, hooks: CompilationHooks): void;
    /**
     * Renders the generated source of the bootstrap code.
     * @param {RenderBootstrapContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {Bootstrap} the generated source of the bootstrap code
     */
    renderBootstrap(renderContext: RenderBootstrapContext, hooks: CompilationHooks): Bootstrap;
    /**
     * Renders the generated source of the require function.
     * @param {RenderBootstrapContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {string} the generated source of the require function
     */
    renderRequire(renderContext: RenderBootstrapContext, hooks: CompilationHooks): string;
    /**
     * Get renamed inline module.
     * @param {Compilation} compilation compilation
     * @param {Module[]} allModules allModules
     * @param {MainRenderContext} renderContext renderContext
     * @param {Set<Module>} inlinedModules inlinedModules
     * @param {ChunkRenderContext} chunkRenderContext chunkRenderContext
     * @param {CompilationHooks} hooks hooks
     * @param {boolean | undefined} allStrict allStrict
     * @param {boolean} hasChunkModules hasChunkModules
     * @returns {RenamedInlinedModules | false} renamed inlined modules
     */
    _getRenamedInlineModule(compilation: Compilation, allModules: Module[], renderContext: MainRenderContext, inlinedModules: Set<Module>, chunkRenderContext: ChunkRenderContext, hooks: CompilationHooks, allStrict: boolean | undefined, hasChunkModules: boolean): RenamedInlinedModules | false;
}
declare namespace JavascriptModulesPlugin {
    export { getCompilationHooks, chunkHasJs, Scope, Variable, Reference, RenderContext, MainRenderContext, ChunkRenderContext, RenderBootstrapContext, StartupRenderContext, ModuleRenderContext, CompilationHooks, Bootstrap, ModuleFactoryCacheEntry, RenamedInlinedModules };
}
import type { Source } from "webpack-sources";
import type CodeGenerationResults from "../module/CodeGenerationResults";
import type Compiler from "../Compiler";
import type Compilation from "../Compilation";
import type Module from "../module/Module";
import type Hash from "../util/Hash";
import type Chunk from "../graph/Chunk";
import type { OutputNormalizedWithDefaults as OutputOptions } from "../config/defaults";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * @type {SyncWaterfallHook<[Source, Module, ModuleRenderContext]>}
     */
    renderModuleContent: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, Module, ModuleRenderContext]>}
     */
    renderModuleContainer: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, Module, ModuleRenderContext]>}
     */
    renderModulePackage: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, RenderContext]>}
     */
    render: SyncWaterfallHook<[Source, RenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, RenderContext]>}
     * @since 5.41.0
     */
    renderContent: SyncWaterfallHook<[Source, RenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, Module, StartupRenderContext]>}
     * @since 5.22.0
     */
    renderStartup: SyncWaterfallHook<[Source, Module, StartupRenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, RenderContext]>}
     */
    renderChunk: SyncWaterfallHook<[Source, RenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, RenderContext]>}
     */
    renderMain: SyncWaterfallHook<[Source, RenderContext]>;
    /**
     * @type {SyncWaterfallHook<[string, RenderBootstrapContext]>}
     */
    renderRequire: SyncWaterfallHook<[string, RenderBootstrapContext]>;
    /**
     * @type {SyncBailHook<[Module, Partial<RenderBootstrapContext>], string | void>}
     * @since 5.22.0
     */
    inlineInRuntimeBailout: SyncBailHook<[Module, Partial<RenderBootstrapContext>], string | void>;
    /**
     * @type {SyncBailHook<[Module, RenderContext], string | void>}
     * @since 5.22.0
     */
    embedInRuntimeBailout: SyncBailHook<[Module, RenderContext], string | void>;
    /**
     * @type {SyncBailHook<[RenderContext], string | void>}
     * @since 5.26.1
     */
    strictRuntimeBailout: SyncBailHook<[RenderContext], string | void>;
    /**
     * @type {SyncHook<[Chunk, Hash, ChunkHashContext]>}
     */
    chunkHash: SyncHook<[Chunk, Hash, Compilation.ChunkHashContext]>;
    /**
     * @type {SyncBailHook<[Chunk, RenderContext], boolean | void>}
     * @since 5.2.1
     */
    useSourceMap: SyncBailHook<[Chunk, RenderContext], boolean | void>;
};
/**
 * Returns true, when a JS file is needed for this chunk.
 * @param {Chunk} chunk a chunk
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @returns {boolean} true, when a JS file is needed for this chunk
 */
declare function chunkHasJs(chunk: Chunk, chunkGraph: ChunkGraph): boolean;
type Scope = {
    type: analyzeScope.ScopeType;
    blockType: string;
    blockStart: number;
    upper: /*elided*/ any | null;
    childScopes: /*elided*/ any[];
    variables: {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: /*elided*/ any;
            resolved: /*elided*/ any | undefined;
        }[];
        scope: /*elided*/ any;
    }[];
    _index: Map<string, {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: /*elided*/ any;
            resolved: /*elided*/ any | undefined;
        }[];
        scope: /*elided*/ any;
    }> | undefined;
    variableScope: /*elided*/ any;
    paramBoundary: number;
    _recorded: boolean;
    getBinding(name: string): {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: /*elided*/ any;
            resolved: /*elided*/ any | undefined;
        }[];
        scope: /*elided*/ any;
    } | undefined;
};
type Variable = {
    name: string;
    identifiers: import("estree").Identifier[];
    references: {
        identifier: import("estree").Identifier;
        from: {
            type: analyzeScope.ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: /*elided*/ any[];
            _index: Map<string, /*elided*/ any> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): /*elided*/ any | undefined;
        };
        resolved: /*elided*/ any | undefined;
    }[];
    scope: {
        type: analyzeScope.ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: /*elided*/ any[];
        _index: Map<string, /*elided*/ any> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): /*elided*/ any | undefined;
    };
};
type Reference = {
    identifier: import("estree").Identifier;
    from: {
        type: analyzeScope.ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: /*elided*/ any[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: /*elided*/ any[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: /*elided*/ any[];
            scope: /*elided*/ any;
        } | undefined;
    };
    resolved: {
        name: string;
        identifiers: import("estree").Identifier[];
        references: /*elided*/ any[];
        scope: {
            type: analyzeScope.ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: /*elided*/ any[];
            _index: Map<string, /*elided*/ any> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): /*elided*/ any | undefined;
        };
    } | undefined;
};
/**
 * Defines the render context type used by this module.
 */
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
/**
 * Defines the main render context type used by this module.
 */
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
/**
 * Defines the chunk render context type used by this module.
 */
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
    /**
     * entry module inlined at the chunk top level instead of the registry
     */
    inlinedEntryModule?: Module | undefined;
    /**
     * rendered body of the inlined entry module
     */
    inlinedEntrySource?: Source | undefined;
};
/**
 * Defines the render bootstrap context type used by this module.
 */
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
/**
 * Defines the startup render context type used by this module.
 */
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
    inlined?: boolean | undefined;
    /**
     * the inlined entry module is wrapped in an IIFE
     */
    inlinedInIIFE?: boolean | undefined;
    /**
     * whether the top-level exports declaration needs to be generated
     */
    needExportsDeclaration?: boolean | undefined;
    /**
     * the inlined entry's top-level declarations renamed to avoid a collision, original to new name
     */
    renamedDeclarations?: Map<string, string> | undefined;
    /**
     * the startup already awaited the last entry, so `__webpack_exports__` holds its settled exports
     */
    exportsAwaited?: boolean | undefined;
};
/**
 * Defines the module render context type used by this module.
 */
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
type CompilationHooks = ReturnType<typeof createCompilationHooks>;
type Bootstrap = {
    header: string[];
    beforeStartup: string[];
    startup: string[];
    afterStartup: string[];
    allowInlineStartup: boolean;
    exportsAwaited: boolean;
};
type ModuleFactoryCacheEntry = {
    source: Source;
    needModule: boolean;
    needExports: boolean;
    needRequire: boolean;
    needThisAsExports: boolean;
    needStrict: boolean | undefined;
    renderShorthand: boolean;
    next: ModuleFactoryCacheEntry | undefined;
};
type RenamedInlinedModules = {
    /**
     * each inlined module's rendered source, renamed where it collided
     */
    sources: Map<Module, Source>;
    /**
     * each renamed module's declarations, original to new name
     */
    renamedDeclarations: Map<Module, Map<string, string>>;
};
import { SyncWaterfallHook } from "tapable";
import { SyncBailHook } from "tapable";
import { SyncHook } from "tapable";
import type ChunkGraph from "../graph/ChunkGraph";
import analyzeScope = require("./ScopeAnalyzer");
import type DependencyTemplates from "../template/DependencyTemplates";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type ModuleGraph from "../graph/ModuleGraph";
import InitFragment = require("../template/InitFragment");
/**
 * Defines the render context type used by this module.
 * @typedef {object} RenderContext
 * @property {Chunk} chunk the chunk
 * @property {DependencyTemplates} dependencyTemplates the dependency templates
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {CodeGenerationResults} codeGenerationResults results of code generation
 * @property {boolean | undefined} strictMode rendering in strict context
 */
/**
 * Defines the main render context type used by this module.
 * @typedef {object} MainRenderContext
 * @property {Chunk} chunk the chunk
 * @property {DependencyTemplates} dependencyTemplates the dependency templates
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {CodeGenerationResults} codeGenerationResults results of code generation
 * @property {string} hash hash to be used for render call
 * @property {boolean | undefined} strictMode rendering in strict context
 */
/**
 * Defines the chunk render context type used by this module.
 * @typedef {object} ChunkRenderContext
 * @property {Chunk} chunk the chunk
 * @property {DependencyTemplates} dependencyTemplates the dependency templates
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {CodeGenerationResults} codeGenerationResults results of code generation
 * @property {InitFragment<ChunkRenderContext>[]} chunkInitFragments init fragments for the chunk
 * @property {boolean | undefined} strictMode rendering in strict context
 * @property {Module=} inlinedEntryModule entry module inlined at the chunk top level instead of the registry
 * @property {Source=} inlinedEntrySource rendered body of the inlined entry module
 */
/**
 * Defines the render bootstrap context type used by this module.
 * @typedef {object} RenderBootstrapContext
 * @property {Chunk} chunk the chunk
 * @property {CodeGenerationResults} codeGenerationResults results of code generation
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {string} hash hash to be used for render call
 */
/**
 * Defines the startup render context type used by this module.
 * @typedef {object} StartupRenderContext
 * @property {Chunk} chunk the chunk
 * @property {DependencyTemplates} dependencyTemplates the dependency templates
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {CodeGenerationResults} codeGenerationResults results of code generation
 * @property {boolean | undefined} strictMode rendering in strict context
 * @property {boolean=} inlined inlined
 * @property {boolean=} inlinedInIIFE the inlined entry module is wrapped in an IIFE
 * @property {boolean=} needExportsDeclaration whether the top-level exports declaration needs to be generated
 * @property {Map<string, string>=} renamedDeclarations the inlined entry's top-level declarations renamed to avoid a collision, original to new name
 * @property {boolean=} exportsAwaited the startup already awaited the last entry, so `__webpack_exports__` holds its settled exports
 */
/**
 * Defines the module render context type used by this module.
 * @typedef {object} ModuleRenderContext
 * @property {Chunk} chunk the chunk
 * @property {DependencyTemplates} dependencyTemplates the dependency templates
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {CodeGenerationResults} codeGenerationResults results of code generation
 * @property {InitFragment<ChunkRenderContext>[]} chunkInitFragments init fragments for the chunk
 * @property {boolean | undefined} strictMode rendering in strict context
 * @property {boolean} factory true: renders as factory method, false: pure module content
 * @property {boolean=} inlinedInIIFE the inlined entry module is wrapped in an IIFE, existing only when `factory` is set to false
 * @property {boolean=} renderInObject render module in object container
 */
declare function createCompilationHooks(): {
    /**
     * @type {SyncWaterfallHook<[Source, Module, ModuleRenderContext]>}
     */
    renderModuleContent: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, Module, ModuleRenderContext]>}
     */
    renderModuleContainer: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, Module, ModuleRenderContext]>}
     */
    renderModulePackage: SyncWaterfallHook<[Source, Module, ModuleRenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, RenderContext]>}
     */
    render: SyncWaterfallHook<[Source, RenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, RenderContext]>}
     * @since 5.41.0
     */
    renderContent: SyncWaterfallHook<[Source, RenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, Module, StartupRenderContext]>}
     * @since 5.22.0
     */
    renderStartup: SyncWaterfallHook<[Source, Module, StartupRenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, RenderContext]>}
     */
    renderChunk: SyncWaterfallHook<[Source, RenderContext]>;
    /**
     * @type {SyncWaterfallHook<[Source, RenderContext]>}
     */
    renderMain: SyncWaterfallHook<[Source, RenderContext]>;
    /**
     * @type {SyncWaterfallHook<[string, RenderBootstrapContext]>}
     */
    renderRequire: SyncWaterfallHook<[string, RenderBootstrapContext]>;
    /**
     * @type {SyncBailHook<[Module, Partial<RenderBootstrapContext>], string | void>}
     * @since 5.22.0
     */
    inlineInRuntimeBailout: SyncBailHook<[Module, Partial<RenderBootstrapContext>], string | void>;
    /**
     * @type {SyncBailHook<[Module, RenderContext], string | void>}
     * @since 5.22.0
     */
    embedInRuntimeBailout: SyncBailHook<[Module, RenderContext], string | void>;
    /**
     * @type {SyncBailHook<[RenderContext], string | void>}
     * @since 5.26.1
     */
    strictRuntimeBailout: SyncBailHook<[RenderContext], string | void>;
    /**
     * @type {SyncHook<[Chunk, Hash, ChunkHashContext]>}
     */
    chunkHash: SyncHook<[Chunk, Hash, Compilation.ChunkHashContext]>;
    /**
     * @type {SyncBailHook<[Chunk, RenderContext], boolean | void>}
     * @since 5.2.1
     */
    useSourceMap: SyncBailHook<[Chunk, RenderContext], boolean | void>;
};
