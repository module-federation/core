export = RuntimeTemplate;
declare class RuntimeTemplate {
    /**
     * @param {Compilation} compilation the compilation
     * @param {OutputOptions} outputOptions the compilation output options
     * @param {RequestShortener} requestShortener the request shortener
     */
    constructor(compilation: Compilation, outputOptions: OutputOptions, requestShortener: RequestShortener);
    compilation: import("./Compilation");
    outputOptions: import("../declarations/WebpackOptions").OutputNormalized;
    requestShortener: import("./RequestShortener");
    globalObject: string;
    contentHashReplacement: string;
    isIIFE(): boolean;
    isModule(): boolean;
    supportsConst(): boolean;
    supportsArrowFunction(): boolean;
    supportsOptionalChaining(): boolean;
    supportsForOf(): boolean;
    supportsDestructuring(): boolean;
    supportsBigIntLiteral(): boolean;
    supportsDynamicImport(): boolean;
    supportsEcmaScriptModuleSyntax(): boolean;
    supportTemplateLiteral(): boolean;
    returningFunction(returnValue: any, args?: string): string;
    basicFunction(args: any, body: any): string;
    /**
     * @param {Array<string|{expr: string}>} args args
     * @returns {string} result expression
     */
    concatenation(...args: Array<string | {
        expr: string;
    }>): string;
    /**
     * @param {Array<string|{expr: string}>} args args (len >= 2)
     * @returns {string} result expression
     * @private
     */
    private _es5Concatenation;
    expressionFunction(expression: any, args?: string): string;
    emptyFunction(): "x => {}" | "function() {}";
    destructureArray(items: any, value: any): string;
    destructureObject(items: any, value: any): string;
    iife(args: any, body: any): string;
    forEach(variable: any, array: any, body: any): string;
    /**
     * Add a comment
     * @param {object} options Information content of the comment
     * @param {string=} options.request request string used originally
     * @param {string=} options.chunkName name of the chunk referenced
     * @param {string=} options.chunkReason reason information of the chunk
     * @param {string=} options.message additional message
     * @param {string=} options.exportName name of the export
     * @returns {string} comment
     */
    comment({ request, chunkName, chunkReason, message, exportName }: {
        request?: string | undefined;
        chunkName?: string | undefined;
        chunkReason?: string | undefined;
        message?: string | undefined;
        exportName?: string | undefined;
    }): string;
    /**
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error block
     */
    throwMissingModuleErrorBlock({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error function
     */
    throwMissingModuleErrorFunction({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error IIFE
     */
    missingModule({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error statement
     */
    missingModuleStatement({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error code
     */
    missingModulePromise({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * @param {Object} options options object
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {Module} options.module the module
     * @param {string} options.request the request that should be printed as comment
     * @param {string=} options.idExpr expression to use as id expression
     * @param {"expression" | "promise" | "statements"} options.type which kind of code should be returned
     * @returns {string} the code
     */
    weakError({ module, chunkGraph, request, idExpr, type }: {
        chunkGraph: ChunkGraph;
        module: Module;
        request: string;
        idExpr?: string | undefined;
        type: "expression" | "promise" | "statements";
    }): string;
    /**
     * @param {Object} options options object
     * @param {Module} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string} options.request the request that should be printed as comment
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @returns {string} the expression
     */
    moduleId({ module, chunkGraph, request, weak }: {
        module: Module;
        chunkGraph: ChunkGraph;
        request: string;
        weak?: boolean | undefined;
    }): string;
    /**
     * @param {Object} options options object
     * @param {Module | null} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string} options.request the request that should be printed as comment
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} the expression
     */
    moduleRaw({ module, chunkGraph, request, weak, runtimeRequirements }: {
        module: Module | null;
        chunkGraph: ChunkGraph;
        request: string;
        weak?: boolean | undefined;
        runtimeRequirements: Set<string>;
    }): string;
    /**
     * @param {Object} options options object
     * @param {Module | null} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string} options.request the request that should be printed as comment
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} the expression
     */
    moduleExports({ module, chunkGraph, request, weak, runtimeRequirements }: {
        module: Module | null;
        chunkGraph: ChunkGraph;
        request: string;
        weak?: boolean | undefined;
        runtimeRequirements: Set<string>;
    }): string;
    /**
     * @param {Object} options options object
     * @param {Module} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string} options.request the request that should be printed as comment
     * @param {boolean=} options.strict if the current module is in strict esm mode
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} the expression
     */
    moduleNamespace({ module, chunkGraph, request, strict, weak, runtimeRequirements }: {
        module: Module;
        chunkGraph: ChunkGraph;
        request: string;
        strict?: boolean | undefined;
        weak?: boolean | undefined;
        runtimeRequirements: Set<string>;
    }): string;
    /**
     * @param {Object} options options object
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {AsyncDependenciesBlock=} options.block the current dependencies block
     * @param {Module} options.module the module
     * @param {string} options.request the request that should be printed as comment
     * @param {string} options.message a message for the comment
     * @param {boolean=} options.strict if the current module is in strict esm mode
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} the promise expression
     */
    moduleNamespacePromise({ chunkGraph, block, module, request, message, strict, weak, runtimeRequirements }: {
        chunkGraph: ChunkGraph;
        block?: AsyncDependenciesBlock | undefined;
        module: Module;
        request: string;
        message: string;
        strict?: boolean | undefined;
        weak?: boolean | undefined;
        runtimeRequirements: Set<string>;
    }): string;
    /**
     * @param {Object} options options object
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {RuntimeSpec=} options.runtime runtime for which this code will be generated
     * @param {RuntimeSpec | boolean=} options.runtimeCondition only execute the statement in some runtimes
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} expression
     */
    runtimeConditionExpression({ chunkGraph, runtimeCondition, runtime, runtimeRequirements }: {
        chunkGraph: ChunkGraph;
        runtime?: RuntimeSpec | undefined;
        runtimeCondition?: (RuntimeSpec | boolean) | undefined;
        runtimeRequirements: Set<string>;
    }): string;
    /**
     *
     * @param {Object} options options object
     * @param {boolean=} options.update whether a new variable should be created or the existing one updated
     * @param {Module} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string} options.request the request that should be printed as comment
     * @param {string} options.importVar name of the import variable
     * @param {Module} options.originModule module in which the statement is emitted
     * @param {boolean=} options.weak true, if this is a weak dependency
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {[string, string]} the import statement and the compat statement
     */
    importStatement({ update, module, chunkGraph, request, importVar, originModule, weak, runtimeRequirements }: {
        update?: boolean | undefined;
        module: Module;
        chunkGraph: ChunkGraph;
        request: string;
        importVar: string;
        originModule: Module;
        weak?: boolean | undefined;
        runtimeRequirements: Set<string>;
    }): [string, string];
    /**
     * @param {Object} options options
     * @param {ModuleGraph} options.moduleGraph the module graph
     * @param {Module} options.module the module
     * @param {string} options.request the request
     * @param {string | string[]} options.exportName the export name
     * @param {Module} options.originModule the origin module
     * @param {boolean|undefined} options.asiSafe true, if location is safe for ASI, a bracket can be emitted
     * @param {boolean} options.isCall true, if expression will be called
     * @param {boolean | null} options.callContext when false, call context will not be preserved
     * @param {boolean} options.defaultInterop when true and accessing the default exports, interop code will be generated
     * @param {string} options.importVar the identifier name of the import variable
     * @param {InitFragment<TODO>[]} options.initFragments init fragments will be added here
     * @param {RuntimeSpec} options.runtime runtime for which this code will be generated
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} expression
     */
    exportFromImport({ moduleGraph, module, request, exportName, originModule, asiSafe, isCall, callContext, defaultInterop, importVar, initFragments, runtime, runtimeRequirements }: {
        moduleGraph: ModuleGraph;
        module: Module;
        request: string;
        exportName: string | string[];
        originModule: Module;
        asiSafe: boolean | undefined;
        isCall: boolean;
        callContext: boolean | null;
        defaultInterop: boolean;
        importVar: string;
        initFragments: InitFragment<TODO>[];
        runtime: RuntimeSpec;
        runtimeRequirements: Set<string>;
    }): string;
    /**
     * @param {Object} options options
     * @param {AsyncDependenciesBlock} options.block the async block
     * @param {string} options.message the message
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} expression
     */
    blockPromise({ block, message, chunkGraph, runtimeRequirements }: {
        block: AsyncDependenciesBlock;
        message: string;
        chunkGraph: ChunkGraph;
        runtimeRequirements: Set<string>;
    }): string;
    /**
     * @param {Object} options options
     * @param {AsyncDependenciesBlock} options.block the async block
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @param {string=} options.request request string used originally
     * @returns {string} expression
     */
    asyncModuleFactory({ block, chunkGraph, runtimeRequirements, request }: {
        block: AsyncDependenciesBlock;
        chunkGraph: ChunkGraph;
        runtimeRequirements: Set<string>;
        request?: string | undefined;
    }): string;
    /**
     * @param {Object} options options
     * @param {Dependency} options.dependency the dependency
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @param {string=} options.request request string used originally
     * @returns {string} expression
     */
    syncModuleFactory({ dependency, chunkGraph, runtimeRequirements, request }: {
        dependency: Dependency;
        chunkGraph: ChunkGraph;
        runtimeRequirements: Set<string>;
        request?: string | undefined;
    }): string;
    /**
     * @param {Object} options options
     * @param {string} options.exportsArgument the name of the exports object
     * @param {Set<string>} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} statement
     */
    defineEsModuleFlagStatement({ exportsArgument, runtimeRequirements }: {
        exportsArgument: string;
        runtimeRequirements: Set<string>;
    }): string;
    /**
     * @param {Object} options options object
     * @param {Module} options.module the module
     * @param {string} options.publicPath the public path
     * @param {RuntimeSpec=} options.runtime runtime
     * @param {CodeGenerationResults} options.codeGenerationResults the code generation results
     * @returns {string} the url of the asset
     */
    assetUrl({ publicPath, runtime, module, codeGenerationResults }: {
        module: Module;
        publicPath: string;
        runtime?: RuntimeSpec | undefined;
        codeGenerationResults: CodeGenerationResults;
    }): string;
}
declare namespace RuntimeTemplate {
    export { OutputOptions, AsyncDependenciesBlock, ChunkGraph, CodeGenerationResults, Compilation, Dependency, Module, ModuleGraph, RequestShortener, RuntimeSpec };
}
type ChunkGraph = import("./ChunkGraph");
type Module = import("./Module");
type AsyncDependenciesBlock = import("./AsyncDependenciesBlock");
type RuntimeSpec = import("./util/runtime").RuntimeSpec;
type ModuleGraph = import("./ModuleGraph");
import InitFragment = require("./InitFragment");
type Dependency = import("./Dependency");
type CodeGenerationResults = import("./CodeGenerationResults");
type Compilation = import("./Compilation");
type OutputOptions = import("../declarations/WebpackOptions").OutputNormalized;
type RequestShortener = import("./RequestShortener");
