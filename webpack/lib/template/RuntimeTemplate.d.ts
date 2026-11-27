export = RuntimeTemplate;
declare class RuntimeTemplate {
    /**
     * Fills in the names reserved during code generation, once the hashes they are built
     * from exist: a chunk's own filename, and the compilation hash inside any other
     * emitted asset's. Replaces in place so the asset keeps its mappings, and runs before
     * anything reads it — `RealContentHashPlugin` still repairs each rewritten chunk's own
     * name later. Registered wherever `output.module` is read, since nothing reserves a
     * stand-in without it — a reservation cannot arrange this itself, as a module restored
     * from the cache carries one without being generated again.
     * @param {Compiler} compiler the compiler
     * @returns {void}
     */
    static fillReservedNames(compiler: Compiler): void;
    /**
     * Reads back what `_reserveAnalyzableSpecifier` wrote. Source of our own can spell the
     * token too, so nothing about a payload is given and every shape it does not produce
     * is refused rather than reached for.
     * @param {string} payload the encoded half of a stand-in
     * @returns {SpecifierPart[] | null} what it resolves to, or `null` if unreadable
     */
    static _readAnalyzableSpecifier(payload: string): SpecifierPart[] | null;
    /**
     * Creates an instance of RuntimeTemplate.
     * @param {Compilation} compilation the compilation
     * @param {OutputOptions} outputOptions the compilation output options
     * @param {RequestShortener} requestShortener the request shortener
     */
    constructor(compilation: Compilation, outputOptions: OutputOptions, requestShortener: RequestShortener);
    /** @type {Compilation} */
    compilation: Compilation;
    outputOptions: OutputOptions;
    /** @type {RequestShortener} */
    requestShortener: RequestShortener;
    /** @type {string} */
    globalObject: string;
    /** @type {string} */
    contentHashReplacement: string;
    /** @type {Set<string>} */
    _analyzableRepairedAssets: Set<string>;
    /** @type {WeakMap<Chunk, boolean>} */
    _chunkNamedWithoutContent: WeakMap<Chunk, boolean>;
    /** @type {WeakMap<Chunk, string>} */
    _foldedAnalyzableNames: WeakMap<Chunk, string>;
    /** @type {WeakMap<Chunk, Map<string, string>>} */
    _analyzableAssetNames: WeakMap<Chunk, Map<string, string>>;
    /** @type {Map<Chunk, Set<string>> | undefined} */
    _namesBakedInto: Map<Chunk, Set<string>> | undefined;
    /** @type {Map<string, Chunk> | undefined} */
    _chunksByIdForFold: Map<string, Chunk> | undefined;
    /** @type {Set<Chunk> | undefined} */
    _chunksBakingFullHash: Set<Chunk> | undefined;
    /** @type {string | false | undefined} */
    _publicPathShapeText: string | false | undefined;
    /** @type {string | null | undefined} */
    _publicPathClimbText: string | null | undefined;
    /** @type {WeakMap<Chunk, Placement>} */
    _placementByChunk: WeakMap<Chunk, Placement>;
    /** @type {WeakMap<Chunk, string>} */
    _hotUpdateUndoByChunk: WeakMap<Chunk, string>;
    /** @type {string | undefined} */
    _hotUpdateShapeText: string | undefined;
    /** @type {Map<string, string | null | undefined>} */
    _entryBaseUriByRuntime: Map<string, string | null | undefined>;
    /** @type {WasmGroups | undefined} */
    _wasmGroupsValue: WasmGroups | undefined;
    /** @type {string[] | undefined} */
    _analyzableBailoutSink: string[] | undefined;
    /** @type {Module | undefined} */
    _analyzableGeneratingModule: Module | undefined;
    /** @type {Map<string, boolean> | undefined} */
    _wasmAnchorKnownByGroup: Map<string, boolean> | undefined;
    isIIFE(): boolean;
    /**
     * Whether the global object expression reads the `this` binding, which only
     * refers to the global object outside of strict mode.
     * @returns {boolean} true, when it reads `this`
     */
    globalObjectUsesThis(): boolean;
    isModule(): boolean;
    isNeutralPlatform(): boolean;
    /**
     * Whether the bundle targets node and web at once (universal `["node", "web"]` + `output.module`), like `isUniversalTarget` in `WebpackOptionsApply`.
     * @returns {boolean} true for a universal target
     */
    isUniversalTarget(): boolean;
    /**
     * Runtime expression that is truthy in browser-like environments (a DOM
     * `document` or a worker `self`) and falsy in Node.js. Single source of
     * truth for branching a universal ("node-or-web") target at runtime.
     * @returns {string} runtime condition expression
     */
    isWebLikePlatformExpression(): string;
    /**
     * Expression for the global registry that collects CSS server-side when there
     * is no DOM (SSR). Read it with `__webpack_css_server_styles__`; it is keyed
     * by the style/chunk identifier and namespaced by `output.uniqueName`.
     * Targets without `globalThis` go through the `__webpack_require__.g`
     * polyfill, so consumers must also require `RuntimeGlobals.global`.
     * @returns {string} runtime expression evaluating to the registry object
     */
    cssServerStyleRegistry(): string;
    supportsConst(): boolean;
    supportsLet(): boolean;
    supportsMethodShorthand(): boolean;
    supportsLogicalAssignment(): boolean;
    supportsArrowFunction(): boolean;
    supportsAsyncFunction(): boolean;
    supportsGenerator(): boolean;
    supportsTopLevelAwait(): boolean;
    supportsOptionalChaining(): boolean;
    supportsSpread(): boolean;
    supportsObjectHasOwn(): boolean;
    supportsSymbol(): boolean;
    supportsForOf(): boolean;
    supportsDestructuring(): boolean;
    supportsBigIntLiteral(): boolean;
    supportsDynamicImport(): boolean;
    supportsEcmaScriptModuleSyntax(): boolean;
    supportsDeferImport(): boolean;
    supportsSourceImport(): boolean;
    supportsModulePreload(): boolean;
    /**
     * Whether the deferred fill rewrote a chunk whose hashed name would otherwise go
     * stale, which `RealContentHashPlugin` reads to run — and to repair `[chunkhash]`
     * names — where `optimization.realContentHash` did not ask for it.
     * @returns {boolean} true once the fill has marked such a chunk
     */
    needsAnalyzableRepair(): boolean;
    /**
     * The assets the deferred fill rewrote under a name that has to be repaired: an
     * on-demand repair renames only these and whatever names them.
     * @returns {ReadonlySet<string>} their names
     */
    analyzableRepairedAssets(): ReadonlySet<string>;
    /**
     * The `devtool` value wrapping a javascript module in `eval(...)`, read through both
     * spellings — a plain string, and the per-asset-type array.
     * @returns {string | undefined} the value, or undefined when no devtool wraps modules
     */
    _evalWrappingDevtool(): string | undefined;
    /**
     * Whether a reference a foreign bundler can follow without running webpack's runtime
     * may be emitted — the one question every caller asks, in the form it is asking for:
     *
     * - `"import"` — a literal `import("./chunk.js")` in place of `ensureChunk(id)`
     * - `"url"` — a literal `new URL(<file>, import.meta.url)`
     * - `"url-runtime"` — the same, written into a runtime module rather than a module
     * - `"url-inline"` — whether such a reference names the file at the call site
     * - `"wasm"` — the same, fully baked for a wasm binary the runtime would name
     * - `"wasm-relative"` — a wasm path built at runtime under an `import.meta.url` base
     *
     * `"url-inline"` differs from `"url"` only in taking the `.p + <file>` fallback as
     * an answer too — both name the file where it is used rather than through the
     * asset's javascript wrapper, which is what decides whether that wrapper is emitted.
     *
     * A name code generation cannot settle may still be baked, through a stand-in the
     * deferred pass fills in. Not covered here, because only the reference can tell: a
     * chunk with no id, and one this compilation emits no javascript for.
     * @param {AnalyzableForm} form which reference is being emitted
     * @param {ChunkGraph=} chunkGraph the chunk graph, to place `module` in its runtimes
     * @param {Module=} module the module the reference is emitted into
     * @param {RuntimeSpec=} runtime the runtime the reference is emitted for; the wasm forms answer for the loader it shares rather than for every loader in the compilation
     * @returns {boolean} true when the literal form may be emitted
     */
    supportsAnalyzable(form: AnalyzableForm, chunkGraph?: ChunkGraph | undefined, module?: Module | undefined, runtime?: RuntimeSpec | undefined): boolean;
    /**
     * Reports an analyzable-ESM bailout from outside this class.
     * @param {Module | undefined} module the module the reference is emitted into
     * @param {string} reason why no literal could be baked
     * @returns {void}
     */
    analyzableBailout(module: Module | undefined, reason: string): void;
    /**
     * Records why a reference kept the runtime form, on the module that wrote it —
     * the channel `ModuleConcatenationPlugin` already reports through, so it reaches
     * `stats.optimizationBailout`. Silent unless the build asked for ESM output, where
     * alone the answer is actionable; deduplicated because a module may write many.
     * Answers with `answer` so a caller states the refusal and its reason at once —
     * `false` where it answers a question, `null` where it was building a specifier.
     * @template {false | null} T
     * @param {Module | undefined} module the module the reference is emitted into
     * @param {string} reason why no literal could be baked
     * @param {T} answer what the caller hands back
     * @returns {T} that answer
     */
    _analyzableBailout<T extends false | null>(module: Module | undefined, reason: string, answer: T): T;
    /**
     * Names the module whose code generation starts, so the reasons its references
     * record are handed back by `finishAnalyzableBailouts` and attributed to it.
     * @param {Module} module the module being generated
     * @returns {void}
     */
    beginAnalyzableBailouts(module: Module): void;
    /**
     * Ends the collection `beginAnalyzableBailouts` started, so the reasons can be
     * stored beside the result and reapplied when the cache restores it.
     * @returns {string[] | undefined} the reasons recorded since, or undefined for none
     */
    finishAnalyzableBailouts(): string[] | undefined;
    /**
     * Reapplies the bailouts a cached code generation result was stored with, so a
     * restored module reports the same reasons a generated one does.
     * @param {Module} module the module the result was restored for
     * @param {string[]} reasons the reasons stored beside it
     * @returns {void}
     */
    restoreAnalyzableBailouts(module: Module, reasons: string[]): void;
    /**
     * The reasons a module's references keep the runtime form, as recorded while its
     * code was generated.
     * @param {Module} module the module, a runtime module included
     * @returns {string[]} the reasons, none where every reference bakes
     */
    analyzableBailoutsOf(module: Module): string[];
    /**
     * Whether a name that code generation cannot settle may be reserved as a stand-in
     * and filled in once the hashes exist without a repair behind it. Substituting
     * rewrites a chunk after its own content hash was taken, so either no emitted
     * javascript may be named by its content — with a name like `[name].js` there is
     * nothing to go stale — or `RealContentHashPlugin` has to bring the two back in
     * line, which is what a name this says no to gets: see `_needsRepair`.
     * @param {Iterable<Chunk>} chunks the chunks the stand-in is written into
     * @returns {boolean} true when no name moves with the bytes the fill leaves
     */
    _canDeferAnalyzableName(chunks: Iterable<Chunk>): boolean;
    /**
     * Whether a stand-in written into `chunks` needs the repair pass behind it: their
     * hashed names would otherwise go stale once the fill moves their bytes. The pass
     * is `RealContentHashPlugin`, run on demand where `optimization.realContentHash`
     * did not ask for it, and repairing `[chunkhash]` names too while it is at it.
     * @param {Iterable<Chunk>} chunks the chunks the stand-in is written into
     * @returns {boolean} true when the fill has to mark the name for repair
     */
    _needsRepair(chunks: Iterable<Chunk>): boolean;
    /**
     * These parts as a quoted specifier: the text itself where they spell one already,
     * and a stand-in for the deferred pass where they do not.
     * @param {SpecifierPart[]} parts the whole specifier
     * @param {Iterable<Chunk>} chunks the chunks it is written into
     * @returns {string} it already quoted
     */
    _specifierOf(parts: SpecifierPart[], chunks: Iterable<Chunk>): string;
    /**
     * The parts a stand-in is reserved with, marked where the name it lands in has to
     * be repaired after the fill.
     * @param {boolean} repair what `_needsRepair` answered
     * @param {SpecifierPart[]} parts what the stand-in resolves to
     * @returns {SpecifierPart[]} the parts, marked where the repair is needed
     */
    _markedForRepair(repair: boolean, parts: SpecifierPart[]): SpecifierPart[];
    /**
     * Whether the fill will build these parts out of the compilation hash — the same
     * question `_markChunksBakingFullHash` asks of what was generated, so a stand-in this
     * says yes to is one that moves its chunk into the round after that hash.
     * @param {SpecifierPart[]} parts what the stand-in resolves to
     * @returns {boolean} true when that hash reaches the text
     */
    _partsBakeFullHash(parts: SpecifierPart[]): boolean;
    /**
     * Whether the name this chunk is emitted under is settled before its own content
     * is, which is what leaves it right after a later rewrite. A filename function is
     * asked rather than assumed to read a hash — the same two probes the chunk
     * specifier is resolved with. Memoized per chunk: answering calls that function
     * twice, and a reference asks once for every chunk it is written into.
     * @param {Chunk} chunk a chunk the stand-in is written into
     * @returns {boolean} true when the name does not move with the content
     */
    _chunkNameIndependentOfContent(chunk: Chunk): boolean;
    /**
     * Builds the analyzable `new URL(specifier, import.meta.url)` expression the ESM
     * wasm/asset loader backends use to reference an emitted binary relative to the
     * current module (via `output.importMetaName`) instead of the runtime public-path
     * global — the form other bundlers and webpack itself can statically follow.
     * @param {string} specifier already-rendered URL argument (a literal or expression)
     * @returns {string} the `new URL(...)` expression
     */
    importMetaUrl(specifier: string): string;
    /**
     * Whether a baked asset url resolves against the entry `baseUri` at all. A public
     * path that reaches the same place from any base never reads `.b` — and `auto`
     * resolves to an absolute url too — while output with no baked form has nothing to
     * resolve. Where this is false, what `baseUri` is set to cannot reach the generated
     * code, so it must not reach the module hash either: `URLDependency.updateHash`
     * asks this before contributing one.
     * @returns {boolean} true when the base can change what is generated
     */
    analyzableUrlReadsBaseUri(): boolean;
    /**
     * Whether `output.publicPath` reaches the same place from any base, so a literal may
     * carry it without walking back to the output root first. One whose shape nothing
     * answers needs a base as far as anything here can tell. Never asked of `auto`,
     * which is no path of its own.
     * @returns {boolean} true when no base is needed
     */
    _publicPathNeedsNoBase(): boolean;
    /**
     * Static literal specifier (already quoted) for the `new URL(<here>, import.meta.url)`
     * an asset reference bakes to, or `null` to keep the runtime form. Unlike a wasm
     * binary, the runtime resolves an asset url against `__webpack_require__.b` — the
     * output root, or an entry `baseUri` where one is set — so that base is settled here
     * before the rest of the name is.
     * @param {Module} module the module the reference is emitted into
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {string} filename the asset's name, relative to the output root
     * @param {RuntimeSpec} runtime the runtime the code is generated for
     * @returns {string | null} a quoted literal, or `null` to fall back
     */
    getAnalyzableAssetUrl(module: Module, chunkGraph: ChunkGraph, filename: string, runtime: RuntimeSpec): string | null;
    /**
     * The `baseUri` the entries this code runs under agree on, which replaces the output
     * root an asset url resolves against. Asked per runtime, because that is what the
     * module is generated for: two entries with different bases each get their own
     * source. `undefined` when none of them sets one, `null` when they disagree — an
     * entry that omits it disagrees with one that sets it.
     * @param {RuntimeSpec} runtime the runtime the code is generated for
     * @returns {string | null | undefined} the base those entries agree on
     */
    entryBaseUri(runtime: RuntimeSpec): string | null | undefined;
    /**
     * `output.publicPath` as the constant it will be, for code that would otherwise read
     * `__webpack_require__.p` for a value that never changes. `undefined` when only the
     * hash could say, or when a runtime reassigns `__webpack_public_path__` — then the
     * global is the only thing that knows.
     * @returns {string | undefined} the settled public path
     */
    constantPublicPath(): string | undefined;
    /**
     * Runtime keys grouped by the binaries they share, with what the entries of each
     * group asked for. Code generation runs once for runtimes a module hashes alike in,
     * and nothing in a binary's hash knows which loader will read it — so a binary two
     * runtimes reach carries one shape into both, and a third runtime sharing another
     * binary with either is pulled in after them. Only an entry names a loader; every
     * other chunk of the runtime is served by the one its entry asked for. Asked of the
     * same modules the loaders are created for, and only once per compilation.
     * @returns {WasmGroups} the grouping, and which groups fetch
     */
    _wasmGroups(): WasmGroups;
    /**
     * @param {RuntimeSpec} runtime the runtime being asked about
     * @returns {string[]} the wasm runtime groups it reaches
     */
    _wasmGroupsOf(runtime: RuntimeSpec): string[];
    /**
     * Whether a chunk loads WebAssembly through `fetch`, which is the only loader the
     * public path reaches: `readFile` resolves the binary's name against the chunk it is
     * read from, exactly as a baked literal does, so a public path is irrelevant to it.
     * Answered per group rather than per chunk on purpose — a module's generated source
     * and the runtime module of every chunk holding it have to agree on the shape, and
     * they ask from opposite ends; one loader serves a whole group, so that is the finest
     * scope on which they can. Without a runtime the answer covers the compilation.
     * @param {RuntimeSpec=} runtime the runtime being asked about
     * @returns {boolean} true when a chunk of that runtime fetches its binaries
     */
    _anyWasmChunkFetches(runtime?: RuntimeSpec | undefined): boolean;
    /**
     * Whether a public path needing a base can be spelled from the chunk every binary of
     * a runtime sits in — `fetch` reads it against the document, so a literal climbs back
     * there first. Per group, as `_anyWasmChunkFetches` is, since the two ends must agree.
     * @param {RuntimeSpec=} runtime the runtime being asked about
     * @returns {boolean} true when every binary of that group can be spelled
     */
    _wasmFetchAnchorIsKnown(runtime?: RuntimeSpec | undefined): boolean;
    supportTemplateLiteral(): boolean;
    supportNodePrefixForCoreModules(): boolean;
    /**
     * Renders node prefix for core module.
     * @param {string} mod a module
     * @returns {string} a module with `node:` prefix when supported, otherwise an original name
     */
    renderNodePrefixForCoreModule(mod: string): string;
    /**
     * Renders return const when it is supported, otherwise let when supported, otherwise var.
     * @returns {"const" | "let" | "var"} return `const` when it is supported, otherwise `let` when supported, otherwise `var`
     */
    renderConst(): "const" | "let" | "var";
    /**
     * Renders return let when it is supported, otherwise var.
     * @returns {"let" | "var"} return `let` when it is supported, otherwise `var`
     */
    renderLet(): "let" | "var";
    /**
     * Returning function.
     * @param {string} returnValue return value
     * @param {string} args arguments
     * @returns {string} returning function
     */
    returningFunction(returnValue: string, args?: string): string;
    /**
     * Returns basic function.
     * @param {string} args arguments
     * @param {string | string[]} body body
     * @returns {string} basic function
     */
    basicFunction(args: string, body: string | string[]): string;
    /**
     * Returns result expression.
     * @param {(string | { expr: string })[]} args args
     * @returns {string} result expression
     */
    concatenation(...args: (string | {
        expr: string;
    })[]): string;
    /**
     * Returns result expression.
     * @param {(string | { expr: string })[]} args args (len >= 2)
     * @returns {string} result expression
     * @private
     */
    private _es5Concatenation;
    /**
     * Expression function.
     * @param {string} expression expression
     * @param {string} args arguments
     * @returns {string} expression function code
     */
    expressionFunction(expression: string, args?: string): string;
    /**
     * Returns empty function code.
     * @returns {string} empty function code
     */
    emptyFunction(): string;
    /**
     * Guards an access/call on `object` with optional chaining when supported,
     * otherwise an equivalent `&&` short-circuit. `object` is evaluated twice in
     * the fallback, so it must be side-effect free.
     * @param {string} object base expression (side-effect free)
     * @param {string} access continuation after the optional point, e.g. `()`, `prop`, `method(arg)` or `[key]`
     * @returns {string} guarded access expression
     */
    optionalChaining(object: string, access: string): string;
    /**
     * Reads a node builtin via `process.getBuiltinModule()`, guarded to stay falsy off node so universal `["node", "web"]` bundles don't crash (also falsy on node <22.3).
     * @param {string} request builtin module request as a JS string expression, e.g. from `renderNodePrefixForCoreModule`
     * @param {string=} access member/call chain appended to the module, e.g. `.Worker` or `.createRequire(url)`
     * @returns {string} guarded expression
     */
    getBuiltinModule(request: string, access?: string | undefined): string;
    /**
     * Renders a `then` callback calling `fn` with `args`. An arrow keeps the `this`
     * a method call gives; the bound form is shorter without arrows.
     * @param {string} fn callee, a member of `__webpack_require__` or itself
     * @param {string} args arguments
     * @returns {string} callback expression
     */
    deferredCall(fn: string, args: string): string;
    /**
     * Renders an object-literal method, using method shorthand when supported
     * and falling back to a `prop: function/arrow` property otherwise.
     * @param {string} prop property name (or computed key like `[x]`)
     * @param {string} args arguments
     * @param {string | string[]} body body
     * @returns {string} method code
     */
    method(prop: string, args: string, body: string | string[]): string;
    /**
     * Returns an own-property check, using `Object.hasOwn` when supported and
     * falling back to `Object.prototype.hasOwnProperty.call` otherwise.
     * @param {string} object object expression
     * @param {string} property property expression
     * @returns {string} own-property check expression
     */
    objectHasOwn(object: string, property: string): string;
    /**
     * Returns a self-defaulting assignment, using the `||=` logical assignment
     * operator when supported and falling back to `target = target || value`
     * otherwise. `target` is evaluated twice in the fallback, so it must be
     * side-effect free. The expression evaluates to the resulting value.
     * Models `||` only, so `target` must never hold a legitimate falsy value
     * (`0`, `""`, `false`) — it would be overwritten; use it for object/array defaults.
     * @param {string} target assignment target (side-effect free)
     * @param {string} value default value expression
     * @returns {string} assignment expression
     */
    assignOr(target: string, value: string): string;
    /**
     * Returns destructure array code.
     * @param {string[]} items items
     * @param {string} value value
     * @returns {string} destructure array code
     */
    destructureArray(items: string[], value: string): string;
    /**
     * Destructure object.
     * @param {string[]} items items
     * @param {string} value value
     * @returns {string} destructure object code
     */
    destructureObject(items: string[], value: string): string;
    /**
     * Returns iIFE code.
     * @param {string} args arguments
     * @param {string} body body
     * @returns {string} IIFE code
     */
    iife(args: string, body: string): string;
    /**
     * Returns for each code.
     * @param {string} variable variable
     * @param {string} array array
     * @param {string | string[]} body body
     * @returns {string} for each code
     */
    forEach(variable: string, array: string, body: string | string[]): string;
    /**
     * Returns comment.
     * @param {object} options Information content of the comment
     * @param {string=} options.request request string used originally
     * @param {(string | null)=} options.chunkName name of the chunk referenced
     * @param {string=} options.chunkReason reason information of the chunk
     * @param {string=} options.message additional message
     * @param {string=} options.exportName name of the export
     * @returns {string} comment
     */
    comment({ request, chunkName, chunkReason, message, exportName }: {
        request?: string | undefined;
        chunkName?: (string | null) | undefined;
        chunkReason?: string | undefined;
        message?: string | undefined;
        exportName?: string | undefined;
    }): string;
    /**
     * Throw missing module error block.
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error block
     */
    throwMissingModuleErrorBlock({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * Throw missing module error function.
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error function
     */
    throwMissingModuleErrorFunction({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * Returns generated error IIFE.
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error IIFE
     */
    missingModule({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * Missing module statement.
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error statement
     */
    missingModuleStatement({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * Missing module promise.
     * @param {object} options generation options
     * @param {string=} options.request request string used originally
     * @returns {string} generated error code
     */
    missingModulePromise({ request }: {
        request?: string | undefined;
    }): string;
    /**
     * Returns the code.
     * @param {object} options options object
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {Module} options.module the module
     * @param {string=} options.request the request that should be printed as comment
     * @param {string=} options.idExpr expression to use as id expression
     * @param {"expression" | "promise" | "statements"} options.type which kind of code should be returned
     * @returns {string} the code
     */
    weakError({ module, chunkGraph, request, idExpr, type }: {
        chunkGraph: ChunkGraph;
        module: Module;
        request?: string | undefined;
        idExpr?: string | undefined;
        type: "expression" | "promise" | "statements";
    }): string;
    /**
     * Returns the expression.
     * @param {object} options options object
     * @param {Module} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string=} options.request the request that should be printed as comment
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @returns {string} the expression
     */
    moduleId({ module, chunkGraph, request, weak }: {
        module: Module;
        chunkGraph: ChunkGraph;
        request?: string | undefined;
        weak?: boolean | undefined;
    }): string;
    /**
     * The side-effect annotation for output another build reads back, which is the
     * only output it can pay for — elsewhere it is bytes with no consumer.
     * @returns {string} the annotation, or an empty string
     */
    sideEffectsAnnotation(): string;
    /**
     * A module instantiation's side-effect annotation. Write it only where the
     * statement ends the call: a minifier reads `f(id)(x)` as one and drops it.
     * @param {Module} module the instantiated module
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {string} the annotation, or an empty string when it may have side effects
     */
    moduleSideEffectsAnnotation(module: Module, moduleGraph: ModuleGraph): string;
    /**
     * Returns the expression.
     * @param {object} options options object
     * @param {Module | null} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string=} options.request the request that should be printed as comment
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} the expression
     */
    moduleRaw({ module, chunkGraph, request, weak, runtimeRequirements }: {
        module: Module | null;
        chunkGraph: ChunkGraph;
        request?: string | undefined;
        weak?: boolean | undefined;
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * Returns the expression.
     * @param {object} options options object
     * @param {Module | null} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string} options.request the request that should be printed as comment
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} the expression
     */
    moduleExports({ module, chunkGraph, request, weak, runtimeRequirements }: {
        module: Module | null;
        chunkGraph: ChunkGraph;
        request: string;
        weak?: boolean | undefined;
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * Returns the expression.
     * @param {object} options options object
     * @param {Module} options.module the module
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {string} options.request the request that should be printed as comment
     * @param {boolean=} options.strict if the current module is in strict esm mode
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} the expression
     */
    moduleNamespace({ module, chunkGraph, request, strict, weak, runtimeRequirements }: {
        module: Module;
        chunkGraph: ChunkGraph;
        request: string;
        strict?: boolean | undefined;
        weak?: boolean | undefined;
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * Module namespace promise.
     * @param {object} options options object
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {AsyncDependenciesBlock=} options.block the current dependencies block
     * @param {Module} options.module the module
     * @param {string} options.request the request that should be printed as comment
     * @param {string} options.message a message for the comment
     * @param {boolean=} options.strict if the current module is in strict esm mode
     * @param {boolean=} options.weak if the dependency is weak (will create a nice error message)
     * @param {Dependency} options.dependency dependency
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @param {Module=} options.originModule the module the `import()` is emitted into
     * @returns {string} the promise expression
     */
    moduleNamespacePromise({ chunkGraph, block, module, request, message, strict, weak, dependency, runtimeRequirements, originModule }: {
        chunkGraph: ChunkGraph;
        block?: AsyncDependenciesBlock | undefined;
        module: Module;
        request: string;
        message: string;
        strict?: boolean | undefined;
        weak?: boolean | undefined;
        dependency: Dependency;
        runtimeRequirements: Module.RuntimeRequirements;
        originModule?: Module | undefined;
    }): string;
    /**
     * Runtime condition expression.
     * @param {object} options options object
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {RuntimeSpec=} options.runtime runtime for which this code will be generated
     * @param {RuntimeSpec | boolean=} options.runtimeCondition only execute the statement in some runtimes
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} expression
     */
    runtimeConditionExpression({ chunkGraph, runtimeCondition, runtime, runtimeRequirements }: {
        chunkGraph: ChunkGraph;
        runtime?: RuntimeSpec | undefined;
        runtimeCondition?: (RuntimeSpec | boolean) | undefined;
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * Returns the import statement and the compat statement.
     * @param {object} options options object
     * @param {boolean=} options.update whether a new variable should be created or the existing one updated
     * @param {Module} options.module the module
     * @param {Module} options.originModule module in which the statement is emitted
     * @param {ModuleGraph} options.moduleGraph the module graph
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @param {string} options.importVar name of the import variable
     * @param {string=} options.request the request that should be printed as comment
     * @param {boolean=} options.weak true, if this is a weak dependency
     * @param {ModuleDependency=} options.dependency module dependency
     * @returns {[string, string]} the import statement and the compat statement
     */
    importStatement({ update, module, moduleGraph, chunkGraph, request, importVar, originModule, weak, dependency, runtimeRequirements }: {
        update?: boolean | undefined;
        module: Module;
        originModule: Module;
        moduleGraph: ModuleGraph;
        chunkGraph: ChunkGraph;
        runtimeRequirements: Module.RuntimeRequirements;
        importVar: string;
        request?: string | undefined;
        weak?: boolean | undefined;
        dependency?: ModuleDependency | undefined;
    }): [string, string];
    /**
     * Export from import.
     * @template GenerateContext
     * @param {object} options options
     * @param {ModuleGraph} options.moduleGraph the module graph
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {Module} options.module the module
     * @param {string} options.request the request
     * @param {string | string[]} options.exportName the export name
     * @param {Module} options.originModule the origin module
     * @param {boolean | undefined} options.asiSafe true, if location is safe for ASI, a bracket can be emitted
     * @param {boolean | undefined} options.isCall true, if expression will be called
     * @param {boolean | null} options.callContext when false, call context will not be preserved
     * @param {boolean} options.defaultInterop when true and accessing the default exports, interop code will be generated
     * @param {string} options.importVar the identifier name of the import variable
     * @param {InitFragment<GenerateContext>[]} options.initFragments init fragments will be added here
     * @param {RuntimeSpec} options.runtime runtime for which this code will be generated
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @param {ModuleDependency} options.dependency module dependency
     * @param {boolean=} options.mangleableNamespace true, when a whole-namespace value may use a decoupled namespace object that keeps the original export names
     * @returns {string} expression
     */
    exportFromImport<GenerateContext>({ moduleGraph, chunkGraph, module, request, exportName, originModule, asiSafe, isCall, callContext, defaultInterop, importVar, initFragments, runtime, runtimeRequirements, dependency, mangleableNamespace }: {
        moduleGraph: ModuleGraph;
        chunkGraph: ChunkGraph;
        module: Module;
        request: string;
        exportName: string | string[];
        originModule: Module;
        asiSafe: boolean | undefined;
        isCall: boolean | undefined;
        callContext: boolean | null;
        defaultInterop: boolean;
        importVar: string;
        initFragments: InitFragment<GenerateContext>[];
        runtime: RuntimeSpec;
        runtimeRequirements: Module.RuntimeRequirements;
        dependency: ModuleDependency;
        mangleableNamespace?: boolean | undefined;
    }): string;
    /**
     * Materializes a namespace object that keeps the original export names while
     * the module's own exports are mangled. Returns undefined when no export was
     * mangled (then the raw namespace object can be used as-is).
     * @template GenerateContext
     * @param {object} options options
     * @param {ModuleGraph} options.moduleGraph the module graph
     * @param {Module} options.module the imported module
     * @param {string} options.importVar the import variable referencing the module
     * @param {InitFragment<GenerateContext>[]} options.initFragments target array for init fragments
     * @param {RuntimeSpec} options.runtime the runtime
     * @param {RuntimeRequirements} options.runtimeRequirements runtime requirements
     * @returns {string | undefined} expression of the materialized namespace object, or undefined
     */
    _materializedNamespaceObject<GenerateContext>({ moduleGraph, module, importVar, initFragments, runtime, runtimeRequirements }: {
        moduleGraph: ModuleGraph;
        module: Module;
        importVar: string;
        initFragments: InitFragment<GenerateContext>[];
        runtime: RuntimeSpec;
        runtimeRequirements: Module.RuntimeRequirements;
    }): string | undefined;
    /**
     * Returns expression.
     * @param {object} options options
     * @param {AsyncDependenciesBlock | undefined} options.block the async block
     * @param {string} options.message the message
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @param {Module=} options.originModule the module the `import()` is emitted into, to report against
     * @returns {string} expression
     */
    blockPromise({ block, message, chunkGraph, runtimeRequirements, originModule }: {
        block: AsyncDependenciesBlock | undefined;
        message: string;
        chunkGraph: ChunkGraph;
        runtimeRequirements: Module.RuntimeRequirements;
        originModule?: Module | undefined;
    }): string;
    /**
     * Whether this chunk's hash settles before every chunk a stand-in would land in.
     * That is what makes a baked name readable from the consuming chunk's own hash, and
     * it is the tie-break that lets one direction of a cycle bake — `createHash` fixes a
     * total order, so the answer is the same in every build.
     * @param {Chunk} chunk the referenced chunk
     * @param {Iterable<Chunk>} targets the chunks the stand-in is written into
     * @returns {boolean} true when this one may bake and the others may not
     */
    _namesBeforeAll(chunk: Chunk, targets: Iterable<Chunk>): boolean;
    /**
     * Whether `createHash` settles `chunk`'s hash before `target`'s: rounds first, then
     * id inside a round. The runtime round is ordered by references between its chunks
     * rather than by id, which the guard below sidesteps by reading no hash from one.
     * @param {Chunk} chunk the chunk whose hash would be read
     * @param {Chunk} target the chunk reading it
     * @returns {boolean} true when the hash exists by the time the target is hashed
     */
    _hashesBefore(chunk: Chunk, target: Chunk): boolean;
    /**
     * Whether the four rounds alone settle `chunk` before `target`, leaving out what the
     * full-hash marks move: the order a runtime module generated in its chunk's round sees.
     * @param {Chunk} chunk the chunk whose hash would be read
     * @param {Chunk} target the chunk reading it
     * @returns {boolean} true when the hash exists by the time the target is hashed
     */
    _hashRoundBefore(chunk: Chunk, target: Chunk): boolean;
    /**
     * Whether a `[chunkhash]`/`[contenthash]` name is settled before every chunk it is
     * written into, so a runtime module generated in its chunk's round can spell it.
     * @param {Chunk} chunk the chunk named
     * @param {string} template what names it
     * @param {Iterable<Chunk>} targets the chunks the name is written into
     * @returns {boolean} true when the hashes it reads exist by then
     */
    _hashedNameSettledBefore(chunk: Chunk, template: string, targets: Iterable<Chunk>): boolean;
    /**
     * Whether the hashes a name reads are on the chunk now, which they are only once its
     * round of `createHash` has run — never while modules are being generated.
     * @param {Chunk} chunk the chunk named
     * @param {string} template what names it
     * @param {string} sourceType which asset of the chunk it names
     * @returns {boolean} true when the name can be resolved here
     */
    _hashedNamePresent(chunk: Chunk, template: string, sourceType: string): boolean;
    /**
     * Whether `createHash` settles this chunk's hash in the round that runs after the
     * compilation hash rather than in one of the four before it. Asked of the chunk
     * graph, which by then says so exactly: a chunk reaches that round by carrying a
     * full-hash runtime module, or by being put there by `_markChunksSettlingLate`.
     * @param {Chunk} chunk the chunk
     * @returns {boolean} true when its hash is taken last
     */
    _settlesLate(chunk: Chunk): boolean;
    /**
     * Whether this chunk's name is settled only once the compilation hash exists, because
     * the deferred pass writes that hash into its bytes. Marking it puts it in
     * `createHash`'s full-hash round, where the name is taken again afterwards — which is
     * what a chunk needing `__webpack_require__.p` gets for free, and what one that bakes
     * the same text instead has to be given.
     * @param {Chunk} chunk the chunk
     * @returns {boolean} true when it was marked
     */
    _bakesFullHash(chunk: Chunk): boolean;
    /**
     * Finds the chunks whose bytes will carry the compilation hash and puts each in
     * `createHash`'s full-hash round, so its name is taken after that hash exists rather
     * than before. Read off what was generated rather than off what asked for it: a
     * module restored from the persistent cache carries a stand-in without being
     * generated again, and the token it carries is the whole question.
     * @returns {void}
     */
    _markChunksSettlingLate(): void;
    /**
     * What the deferred pass will write into this chunk: whether any of it is built from
     * the compilation hash, and which chunks it names. Read off what was generated rather
     * than off what asked for it — a module restored from the persistent cache carries a
     * stand-in without being generated again, and the stand-in spells its own recipe.
     * @param {Chunk} chunk the chunk
     * @param {CodeGenerationResults} results this compilation's generated code
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {{ carriesFullHash: boolean, names: Set<string> } | null} what it writes,
     * or `null` where nothing is written
     */
    _analyzableDemandOf(chunk: Chunk, results: CodeGenerationResults, chunkGraph: ChunkGraph): {
        carriesFullHash: boolean;
        names: Set<string>;
    } | null;
    /**
     * Whether everything in front of a chunk's filename is text the fold can account for.
     * `literal` is already in the chunk's modules, and `undo` is the `../` depth of the
     * asset it lands in, which `_chunkPlacement` reads off the filename template with the
     * hashes neutralized — so both are known while that chunk is hashed. A public path or
     * a template is not: it resolves against the compilation hash, which by then is still
     * being built out of this very hash.
     * @param {SpecifierPart[]} prefix what goes in front of the filename
     * @param {Iterable<Chunk>} chunks the chunks the stand-in is written into
     * @returns {boolean} true when the filename is all that is left to account for
     */
    _foldsWholeName(prefix: SpecifierPart[], chunks: Iterable<Chunk>): boolean;
    /**
     * Folds the names this chunk will have filled in by the deferred pass into its own
     * hash, so a name taken from that hash already stands for the bytes the fill leaves
     * behind — what lets a chunk named by `[chunkhash]`, or by `[contenthash]` with
     * nothing to repair it afterwards, hold a baked reference at all. The same thing
     * `RuntimeModule.dependentHash` does for the runtime form of the reference.
     *
     * Asked of every chunk whose name could move, and answered from the chunk graph
     * rather than from what was generated: a module restored from the persistent cache
     * carries a stand-in without being generated again. That over-counts a chunk whose
     * reference kept the runtime form, which costs a hash that changes when it needn't —
     * never a name that stays put while the bytes move.
     * Memoized because `createHash` asks twice — once for `chunk.hash` and once for
     * `chunk.contentHash` — and nothing an earlier chunk contributes moves between the
     * two, while the walk behind the answer is over everything the chunk reaches.
     * @param {Chunk} chunk the chunk being hashed
     * @param {Hash} hash its hash
     * @returns {void}
     */
    _foldAnalyzableNames(chunk: Chunk, hash: Hash): void;
    /**
     * Drops what the fold cached, once `createHash` is done and nothing reads it again.
     * Replaced rather than emptied: a `WeakMap` has no `clear`.
     * @returns {void}
     */
    _releaseAnalyzableNameCaches(): void;
    /**
     * The chunks a reference emitted into `module` is written into — the assets a
     * stand-in of ours would land in, and so the only ones a deferred fill could go
     * stale in. Resolved through concatenation first: it may have absorbed the module
     * that wrote the reference, and an absorbed one is in no chunk at all.
     * @param {Module} module the module a reference is emitted into
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {Iterable<Chunk>} the chunks holding it
     */
    _moduleChunks(module: Module, chunkGraph: ChunkGraph): Iterable<Chunk>;
    /**
     * The `../` path back out of a public path that needs a base, which is where the
     * chunk loader puts what it fetches. Reads nothing but `output`, so it is answered
     * once: `""` where the path adds no depth, `null` where its shape is unknown.
     * @returns {string | null} the path back out of it
     */
    _publicPathClimb(): string | null;
    /**
     * Where a literal emitted into a chunk is read from: the `../` path back to the
     * output root, and whether the chunk loader fetched the chunk through
     * `output.publicPath` — such a chunk sits one public path below the root the runtime
     * resolves against, where an initial chunk the host fetched does not. Reads only the
     * chunk, so it is memoized on it and shared by every module in it.
     * @param {Chunk} chunk a chunk a reference is written into
     * @returns {Placement} where a literal in it is read from
     */
    _chunkPlacement(chunk: Chunk): Placement;
    /**
     * The chunk's filename with every hash neutralized, which is all the `../` depth
     * needs — hashes are not settled when this is asked and sit in the basename anyway.
     * A function is asked for the template it returns rather than handed to `getPath`,
     * which would have to resolve a placeholder in it against a hash that does not exist
     * yet; one that builds the name out of a hash itself gets a stand-in to build from.
     * @param {Chunk} chunk the chunk
     * @returns {string | null} the shape, or `null` where it cannot be known
     */
    _chunkNameShape(chunk: Chunk): string | null;
    /**
     * The `../` path from a chunk's own asset back to the output root. Hashes are
     * neutralized first: a runtime module is generated once to be hashed, before any
     * hash exists, so resolving one there throws — and `RuntimeModule.updateHash`
     * lets that throw fail the build rather than hashing it.
     * @param {Chunk} chunk the chunk whose asset holds the reference
     * @param {boolean} enforceRelative whether the answer keeps a leading `./`
     * @returns {string} the path back to the output root
     */
    chunkRootOutputDir(chunk: Chunk, enforceRelative: boolean): string;
    /**
     * The one answer every chunk holding a reference agrees on, with either half `null`
     * where they do not — then no one literal is right for all of them.
     * @param {Module} module the module the reference is emitted into
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {Placement} where a literal in it is read from
     */
    _modulePlacement(module: Module, chunkGraph: ChunkGraph): Placement;
    /**
     * Whether each of these chunks is served one way — either the host fetched it or the
     * loader did, not both. One that is both is at two urls a public path apart with no
     * answer of its own, which no per-asset stand-in can supply.
     * @param {Iterable<Chunk>} chunks the chunks a literal is written into
     * @returns {boolean} true when each has an answer to give
     */
    _eachChunkServedOneWay(chunks: Iterable<Chunk>): boolean;
    /**
     * The one answer every chunk in `chunks` agrees on, with either half `null` where
     * they do not — under HMR the update chunk, which re-runs the module, has a say too.
     * @param {Iterable<Chunk>} chunks the chunks a literal is written into
     * @param {boolean=} hot whether a hot update can re-run what is written
     * @returns {Placement} where a literal in them is read from
     */
    _placementOf(chunks: Iterable<Chunk>, hot?: boolean | undefined): Placement;
    /**
     * Static literal specifier (already quoted) for the `new URL(<here>, import.meta.url)`
     * a worker or worklet entry chunk bakes to, or `null` to keep the runtime form. The
     * gate and the build are asked together so every call site agrees on both — the
     * `new Worker(...)` emit, and the resource hint `ResourceHintPlugin` spells for it.
     * @param {string | undefined} overridePublicPath a `publicPath` set on the worker itself
     * @param {Chunk} chunk the worker's entry chunk
     * @param {Module} module the module the reference is emitted into
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {string | null} a quoted literal, or `null` to fall back
     */
    getAnalyzableWorkerUrl(overridePublicPath: string | undefined, chunk: Chunk, module: Module, chunkGraph: ChunkGraph): string | null;
    /**
     * Static literal specifier (already quoted) for a `new URL(<here>, import.meta.url)`
     * or `import(<here>)` pointing at `chunk`'s JS file, or `null` when it can't be known
     * statically — a content hash in the filename, or a dynamic/templated publicPath.
     * @param {string | undefined} overridePublicPath per-dependency public path (wins over `output.publicPath`)
     * @param {Chunk} chunk the chunk to reference
     * @param {Module | undefined} consumingModule the module the reference is emitted
     * into, or `undefined` when `consumingChunks` names where it goes instead
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {Chunk[]=} consumingChunks the chunks the reference is written into, where
     * they are known without a module to read them from
     * @param {string=} sourceType which half of the chunk is named — its javascript by
     * default, or its stylesheet
     * @param {boolean=} hot whether a hot update can re-run what is written
     * @returns {string | null} a JS string literal or expression, or `null` to fall back to the runtime form
     */
    _getAnalyzableChunkSpecifier(overridePublicPath: string | undefined, chunk: Chunk, consumingModule: Module | undefined, chunkGraph: ChunkGraph, consumingChunks?: Chunk[] | undefined, sourceType?: string | undefined, hot?: boolean | undefined): string | null;
    /**
     * The template this chunk's asset of `sourceType` is named by: `undefined` where a
     * function reads a hash, `null` where nothing here names that type or it answers nothing.
     * @param {Chunk} chunk the chunk
     * @param {string} sourceType which asset of the chunk
     * @returns {string | undefined | null} the template
     */
    _chunkAssetTemplate(chunk: Chunk, sourceType: string): string | undefined | null;
    /**
     * The parts that go in front of a name so a literal read from the chunk holding it
     * reaches what the runtime would. A public path needing no base is the whole answer.
     * One that needs a base is read from the output root, so the `../` path back there
     * comes first — and is the whole answer again where the chunk loader fetched this
     * chunk through that same path, since climbing out of it only to spell it again
     * names the place it started from. An entry `baseUri` sits between the two, so
     * there both are written. Never asked of an `auto` public path, which is no path
     * to walk back over.
     * @param {Module | undefined} module the module the reference is emitted into
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {Iterable<Chunk>} chunks the chunks a stand-in would be written into
     * @param {string=} relativeBase an entry `baseUri` read against the output root
     * @param {boolean=} hot whether a hot update can re-run what is written
     * @returns {SpecifierPart[] | null} the parts, or `null` having recorded why not
     */
    _analyzablePathPrefix(module: Module | undefined, chunkGraph: ChunkGraph, chunks: Iterable<Chunk>, relativeBase?: string | undefined, hot?: boolean | undefined): SpecifierPart[] | null;
    /**
     * What a public path puts in front of a filename, as the parts it is built from.
     * A plain one is literal text. A templated one is resolved as far as code
     * generation can, leaving the compilation hash it may carry as a stand-in exactly
     * as `PublicPathRuntimeModule` resolves the same string once that hash exists — and
     * a hash re-encoded to another digest, which no stand-in can carry, is handed to
     * the deferred pass whole instead. A function is called for its value rather than
     * read as a template, so one whose answer moves with the hash is called again there.
     * @param {PublicPath} publicPath the configured public path
     * @returns {SpecifierPart[] | null} the parts, or `null` when it cannot be known
     */
    _resolvePublicPathPrefix(publicPath: PublicPath): SpecifierPart[] | null;
    /**
     * `output.publicPath` as the text it will have the shape of — a function's answer to
     * a stand-in hash, which says whether it is absolute even when its value is not
     * settled yet. `"auto"` reads as the empty string, which needs a base and so takes
     * the path that needs no answer; a function that answers nothing says nothing about
     * its shape either, and nothing may be built on it.
     * @returns {string | undefined} the shape of the public path
     */
    _publicPathShape(): string | undefined;
    /**
     * A path built by a function, resolved to the value it will have — or `null` when
     * it moves with the compilation hash, which code generation does not know.
     * @param {import("./TemplatedPathPlugin").TemplatePathFn} fn the function
     * @param {string | undefined} value its answer to the first probe, or `undefined`
     * when it answered nothing
     * @returns {string | null} the settled value, or `null` when it is hash-dependent
     */
    _resolveHashIndependent(fn: import("./TemplatedPathPlugin").TemplatePathFn, value: string | undefined): string | null;
    /**
     * Static literal specifier (already quoted) for a `new URL(<here>, import.meta.url)`
     * pointing at an emitted file — an asset, or a wasm binary. The base is the asset the
     * reference sits in; the runtime form resolves against the output root instead, so a
     * public path that needs a base is put behind the `../` path back to that root rather
     * than baked as the whole prefix.
     * @param {Module} module the module the reference is emitted into
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {SpecifierPart[]} file the emitted file's name, relative to the output root
     * @param {boolean} bakePublicPath whether the public path belongs in the literal
     * @param {string=} relativeBase an entry `baseUri` the runtime reads against the
     * chunk, so it belongs between the path back to the output root and the public path
     * @returns {string | null} a quoted literal, or `null` to fall back
     */
    _getAnalyzableFileSpecifier(module: Module, chunkGraph: ChunkGraph, file: SpecifierPart[], bakePublicPath: boolean, relativeBase?: string | undefined): string | null;
    /**
     * Static `new URL(<file>, import.meta.url)` for every stylesheet a runtime can load,
     * keyed by chunk id, or `null` when they have to keep the runtime
     * `publicPath + getChunkCssFilename(id)` form. Both the runtime module reading them
     * and the plugin declaring what it needs ask this, so the two always agree. The
     * runtime hands an absolute url string to `link.href`, and so does this — the browser
     * resolves the element against the document, which is not where the chunk sits, and
     * the loader reads the url as text either way.
     * @param {Chunk} runtimeChunk the chunk holding the stylesheet loader
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements what that chunk needs
     * @param {Module=} consumingModule the runtime module, where one exists to report against
     * @returns {Map<ChunkId, string> | null} the urls, or `null` to keep the runtime form
     */
    analyzableCssChunkUrls(runtimeChunk: Chunk, chunkGraph: ChunkGraph, runtimeRequirements: Module.ReadOnlyRuntimeRequirements, consumingModule?: Module | undefined): Map<Chunk.ChunkId, string> | null;
    /**
     * Static `new URL(<file>, import.meta.url).href` for every javascript chunk a
     * runtime can hint at with `<link rel="prefetch"/"modulepreload">`, keyed by chunk
     * id, or `null` when they have to keep the runtime
     * `publicPath + getChunkScriptFilename(id)` form. Both the runtime module reading
     * them and the plugin declaring what it needs ask this, so the two always agree.
     * @param {Chunk} runtimeChunk the chunk holding the hint handlers
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements what that chunk needs
     * @param {Module=} consumingModule the runtime module, where one exists to report against
     * @returns {Map<ChunkId, string> | null} the urls, or `null` to keep the runtime form
     */
    analyzableChunkScriptUrls(runtimeChunk: Chunk, chunkGraph: ChunkGraph, runtimeRequirements: Module.ReadOnlyRuntimeRequirements, consumingModule?: Module | undefined): Map<Chunk.ChunkId, string> | null;
    /**
     * Why no chunk import of this build can be a native `import()`, read from the
     * output configuration alone, or `null` when nothing in it rules one out.
     * @returns {string | null} the reason
     */
    _chunkImportOutputReason(): string | null;
    /**
     * Records that this runtime reads its chunks some way other than a native
     * `import()`, so no literal can name what it loads. Recorded on the entries that
     * chose it, which is where the setting behind it lives.
     * @param {Chunk} chunk the runtime chunk
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {void}
     */
    reportChunkImportBailout(chunk: Chunk, chunkGraph: ChunkGraph): void;
    /**
     * The chunks this loader can be handed an id for: the ones held by a group outside
     * the initial wave, which is what an `import()` or a context map turns into an id.
     * @param {Chunk} runtimeChunk the chunk holding the chunk loader
     * @returns {Set<Chunk>} the chunks reachable from here through a non-initial group
     */
    _loadableChunks(runtimeChunk: Chunk): Set<Chunk>;
    /**
     * Whether the loader still needs to build a url from a chunk id, which is the case
     * for a chunk it can be asked for that `analyzableChunkImports` leaves unnamed: one
     * carrying a runtime of its own, or one a second entrypoint has at startup.
     * @param {Chunk} runtimeChunk the chunk holding the chunk loader
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {boolean} true when an id the map does not hold can reach the loader
     */
    chunkImportsNeedRuntimeUrl(runtimeChunk: Chunk, chunkGraph: ChunkGraph): boolean;
    /**
     * A literal `import()` specifier for every javascript chunk a runtime loads on
     * demand, keyed by chunk id, or `null` when one of them cannot be named here. The
     * map is written into the runtime chunk rather than at each import site, so a
     * hashed chunk name reaches no module that imports it.
     * @param {Chunk} runtimeChunk the chunk holding the chunk loader
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements what that chunk needs
     * @param {Module=} consumingModule the runtime module, where one exists to report against
     * @returns {Map<ChunkId, string> | null} the specifiers, or `null` to keep the runtime form
     */
    analyzableChunkImports(runtimeChunk: Chunk, chunkGraph: ChunkGraph, runtimeRequirements: Module.ReadOnlyRuntimeRequirements, consumingModule?: Module | undefined): Map<Chunk.ChunkId, string> | null;
    /**
     * The urls of one asset of each of `chunks`, written out so they can be read by
     * chunk id, or `null` as soon as one of them cannot be named here.
     * @param {Iterable<Chunk>} chunks the chunks whose asset is wanted
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {Module | undefined} consumingModule the runtime module, where one exists to report against
     * @param {Chunk[]} consumingChunks the chunks the urls are written into
     * @param {string} sourceType which asset of each chunk to name
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements what the runtime chunk needs
     * @returns {Map<ChunkId, string> | null} the urls, or `null` to keep the runtime form
     */
    _analyzableChunkUrls(chunks: Iterable<Chunk>, chunkGraph: ChunkGraph, consumingModule: Module | undefined, consumingChunks: Chunk[], sourceType: string, runtimeRequirements: Module.ReadOnlyRuntimeRequirements): Map<Chunk.ChunkId, string> | null;
    /**
     * The quoted specifier naming one asset of each of `chunks`, keyed by chunk id, or
     * `null` as soon as one of them cannot be named here. What the name is read against
     * is the caller's: a url resolves it, an `import()` hands it to the loader.
     * @param {Iterable<Chunk>} chunks the chunks whose asset is wanted
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {Module | undefined} consumingModule the runtime module, where one exists to report against
     * @param {Chunk[]} consumingChunks the chunks the specifiers are written into
     * @param {string} sourceType which asset of each chunk to name
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements what the runtime chunk needs
     * @returns {Map<ChunkId, string> | null} the specifiers, or `null` to keep the runtime form
     */
    _analyzableChunkSpecifiers(chunks: Iterable<Chunk>, chunkGraph: ChunkGraph, consumingModule: Module | undefined, consumingChunks: Chunk[], sourceType: string, runtimeRequirements: Module.ReadOnlyRuntimeRequirements): Map<Chunk.ChunkId, string> | null;
    /**
     * Whether a url a hot update re-ships moves only with the runtime module's own text:
     * spelled here, or a stand-in of each asset's depth and a hash-free or settled name.
     * @param {string} specifier the specifier already quoted
     * @param {Chunk} chunk the chunk it names
     * @param {string} sourceType which asset of the chunk it names
     * @param {Chunk[]} consumingChunks the chunks the map is written into
     * @returns {boolean} true when no update moves what the fill spells
     */
    _settledUnderHot(specifier: string, chunk: Chunk, sourceType: string, consumingChunks: Chunk[]): boolean;
    /**
     * The `../` path from a chunk's hot update file, which re-runs its modules, back to
     * the output root. Hashes are neutralized; the chunk's own id may add a directory.
     * @param {Chunk} chunk the chunk being updated
     * @returns {string} the path back to the output root
     */
    _hotUpdateUndo(chunk: Chunk): string;
    /**
     * Static `new URL(<file>, import.meta.url)` for the binary emitted for an async wasm
     * module. Only called when `supportsAnalyzable("wasm")` holds.
     * @param {Module} module the async wasm module
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {RuntimeSpec} runtime the runtime
     * @param {RuntimeRequirements} runtimeRequirements runtime requirements
     * @returns {string} expression evaluating to the binary's URL
     */
    getAnalyzableWasmUrl(module: Module, chunkGraph: ChunkGraph, runtime: RuntimeSpec, runtimeRequirements: Module.RuntimeRequirements): string;
    /**
     * The chunk filename template as a plain string. A function is called twice, with
     * a different stand-in hash each time; disagreeing answers mean the name depends on
     * a hash, which is not knowable during code generation, so it is left to the
     * deferred pass to ask again once the hashes are settled.
     * @param {ChunkFilenameTemplate} filenameTemplate the configured template
     * @param {Chunk} chunk the chunk being referenced
     * @param {string} contentHashType which of the chunk's hashes the name reads
     * @returns {string | undefined | null} the template, `undefined` to defer, or
     * `null` to fall back
     */
    _resolveChunkFilenameTemplate(filenameTemplate: Chunk.ChunkFilenameTemplate, chunk: Chunk, contentHashType: string): string | undefined | null;
    /**
     * Whether `module`'s binary is read through `fetch`, the one loader the public path
     * reaches. Asked of its runtimes, not its chunks: only an entry names a loader.
     * @param {Module} module the async wasm module
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {boolean} true when every runtime reaching it fetches
     */
    _wasmModuleFetches(module: Module, chunkGraph: ChunkGraph): boolean;
    /**
     * The loader a chunk's WebAssembly is read with. An entry names one, and every
     * other chunk of the runtime is served by the one its entry asked for — so one
     * that is no entry answers with what `output` says.
     * @param {Chunk} chunk the chunk
     * @returns {WasmLoading} the loader it is served by
     */
    _chunkWasmLoading(chunk: Chunk): WasmLoading;
    /**
     * Async module factory.
     * @param {object} options options
     * @param {AsyncDependenciesBlock} options.block the async block
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @param {string=} options.request request string used originally
     * @param {Module=} options.originModule the module the factory is emitted into
     * @returns {string} expression
     */
    asyncModuleFactory({ block, chunkGraph, runtimeRequirements, request, originModule }: {
        block: AsyncDependenciesBlock;
        chunkGraph: ChunkGraph;
        runtimeRequirements: Module.RuntimeRequirements;
        request?: string | undefined;
        originModule?: Module | undefined;
    }): string;
    /**
     * Sync module factory.
     * @param {object} options options
     * @param {Dependency} options.dependency the dependency
     * @param {ChunkGraph} options.chunkGraph the chunk graph
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @param {string=} options.request request string used originally
     * @returns {string} expression
     */
    syncModuleFactory({ dependency, chunkGraph, runtimeRequirements, request }: {
        dependency: Dependency;
        chunkGraph: ChunkGraph;
        runtimeRequirements: Module.RuntimeRequirements;
        request?: string | undefined;
    }): string;
    /**
     * @param {object} options options
     * @param {Module} options.module the module the body belongs to
     * @param {boolean} options.needModule whether the body reads `module`
     * @param {boolean} options.needExports whether the body reads `exports`
     * @param {boolean} options.needRequire whether the body reads `__webpack_require__`
     * @param {boolean} options.needThisAsExports whether the body reads `this` as exports
     * @param {boolean=} options.shorthand render as a method shorthand, without the `function` keyword
     * @returns {string} the header, ending with the opening brace
     */
    moduleFactoryFnHeader({ module, needModule, needExports, needRequire, needThisAsExports, shorthand }: {
        module: Module;
        needModule: boolean;
        needExports: boolean;
        needRequire: boolean;
        needThisAsExports: boolean;
        shorthand?: boolean | undefined;
    }): string;
    /**
     * Define es module flag statement.
     * @param {object} options options
     * @param {string} options.exportsArgument the name of the exports object
     * @param {RuntimeRequirements} options.runtimeRequirements if set, will be filled with runtime requirements
     * @returns {string} statement
     */
    defineEsModuleFlagStatement({ exportsArgument, runtimeRequirements }: {
        exportsArgument: string;
        runtimeRequirements: Module.RuntimeRequirements;
    }): string;
    /**
     * Reserves a name only the deferred pass can spell, as a stand-in that looks like a
     * relative specifier so the code around it needs no special case. It carries what it
     * resolves to rather than an index into per-build state — a module restored from the
     * persistent cache is never generated again.
     * @param {SpecifierPart[]} parts what the stand-in resolves to, in order
     * @returns {string} the stand-in to emit
     */
    _reserveAnalyzableSpecifier(parts: SpecifierPart[]): string;
    /**
     * Whether text still carries a compilation-hash stand-in, so nothing may be resolved
     * against it here — the fill would land inside an already-resolved result.
     * @param {string} value text that may carry one
     * @returns {boolean} true when one is present
     */
    _hasReservedFullHash(value: string): boolean;
    /**
     * `getPath` data that leaves every compilation-hash placeholder as a stand-in while
     * the rest of the name resolves.
     * @returns {typeof DEFERRED_FULL_HASH_PATH_DATA} the path data
     */
    _deferredFullHashPathData(): typeof DEFERRED_FULL_HASH_PATH_DATA;
}
declare namespace RuntimeTemplate {
    export { ChunkAssetNaming, Placement, WasmGroups, AnalyzableForm, SpecifierPartKind, SpecifierPart, Replacement };
}
import type Compilation from "../Compilation";
import type { OutputNormalizedWithDefaults as OutputOptions } from "../config/defaults";
import type RequestShortener from "../util/RequestShortener";
import type Chunk from "../graph/Chunk";
import type Module from "../module/Module";
import type ChunkGraph from "../graph/ChunkGraph";
import type { RuntimeSpec } from "../util/runtime";
import type ModuleGraph from "../graph/ModuleGraph";
import type AsyncDependenciesBlock from "../graph/AsyncDependenciesBlock";
import type Dependency from "../graph/Dependency";
import type ModuleDependency from "../dependencies/core/ModuleDependency";
import InitFragment = require("./InitFragment");
import type CodeGenerationResults from "../module/CodeGenerationResults";
import type Hash from "../util/Hash";
import type { PublicPath } from "../../declarations/WebpackOptions.d.ts";
import type { WasmLoading } from "../../declarations/WebpackOptions.d.ts";
declare namespace DEFERRED_FULL_HASH_PATH_DATA {
    export let hash: string;
    export { reserveFullHash as hashWithLength };
}
import type Compiler from "../Compiler";
type ChunkAssetNaming = {
    /**
     * what names the asset
     */
    template: (chunk: Chunk, outputOptions: OutputOptions) => Chunk.ChunkFilenameTemplate;
    /**
     * the stand-in kind that spells it once the hashes exist
     */
    standIn: SpecifierPartKind;
};
/**
 * Where a literal is read from — the `../` path back to the output root, and whether
 * the chunk loader fetched the chunk it sits in through `output.publicPath`.
 */
type Placement = {
    /**
     * the path back to the output root
     */
    undo: string | null;
    /**
     * whether the chunk loader fetched the chunk
     */
    loaded: boolean | null;
};
type WasmGroups = {
    /**
     * the group a runtime key answers with
     */
    groupOf: (key: string) => string;
    /**
     * groups an entry of which reads binaries with `fetch`
     */
    fetching: Set<string>;
    /**
     * groups every entry of which fetches
     */
    onlyFetching: Map<string, boolean>;
};
type AnalyzableForm = "import" | "url" | "url-runtime" | "url-inline" | "wasm" | "wasm-relative";
/**
 * One piece of a name only the deferred pass can spell: text as it stands, the `../`
 * path from the asset it sits in to the output root, a template or `output.publicPath`
 * resolved once the hashes exist, one of the assets the chunk with this id emits, or
 * the base everything else is resolved against once it is spelled. A `repair` part
 * spells nothing: it marks a name the repair pass has to bring back in line.
 */
type SpecifierPartKind = "literal" | "undo" | "template" | "publicPath" | "unserved" | "chunk" | "cssChunk" | "base" | "repair";
type SpecifierPart = [SpecifierPartKind, string | number];
/**
 * first character, last character, replacement.
 */
type Replacement = [number, number, string];
/**
 * @param {number=} length how many characters the placeholder asked for
 * @returns {string} the stand-in to emit
 */
declare function reserveFullHash(length?: number | undefined): string;
