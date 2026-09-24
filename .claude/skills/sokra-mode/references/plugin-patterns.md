# sokra plugin patterns: reference with evidence

Blob links point at webpack v5.75.0 (`8241da7`), sokra's last release. Later code in webpack HEAD was reshaped by other maintainers. PR and commit links are on webpack/webpack.

## Plugin shape

- **Validate options at module level.** Create the validator with `createSchemaValidation(require("../schemas/plugins/X.check.js"), () => require("../schemas/plugins/X.json"), { name: "X Plugin", baseDataPath: "options" })` and call `validate(options)` in the constructor. [ContainerPlugin.js#L17][v-cp], commit [e21b1d46f](https://github.com/webpack/webpack/commit/e21b1d46f).
- **Normalize options once in the constructor into private fields** (`this._options`, `this._consumes`). `apply` only reads them. For keyed-or-array config, use `parseOptions(opts, fromString, fromObject)`. [ConsumeSharedPlugin.js#L55][v-csp55].
- **Declare `const PLUGIN_NAME = "XPlugin"`** and use it for every tap.
- **Choose the compilation hook by whether child compilers need it.** Use `thisCompilation` for factory and module wiring that must stay out of child compilers. Use `compilation` for runtime or template wiring that children need too. Destructure `{ normalModuleFactory }` from the hook arguments. [ContainerPlugin.js#L88][v-cp88].
- **Add entries in `make` with `compilation.addEntry(context, dep, entryOptions, cb)`.** Add forced includes in `finishMake` with `compilation.addInclude`. [ProvideSharedPlugin.js#L189][v-psp189].
- **Intercept module creation** with `normalModuleFactory.hooks.factorize` (unresolved request) or `createModule` (resolved resource). Return a custom Module. Skip your own dependency types with `instanceof` to avoid recursion. [ConsumeSharedPlugin.js#L254][v-csp254].
- **Register parser plugins through one `handler(parser, parserOptions)`.** Tap it for `javascript/auto`, `javascript/dynamic`, and `javascript/esm`, and return early when the feature is disabled in `parserOptions`. [APIPlugin.js#L239][v-api239].
- **Tap with a named stage, never a magic number.** Use `{ name, stage: STAGE_ADVANCED }` or `Compilation.PROCESS_ASSETS_STAGE_*`. [SplitChunksPlugin.js#L798][v-scp798].
- **Use `compiler.webpack` instead of `require("webpack")`** ([#12606](https://github.com/webpack/webpack/issues/12606)). Do asset work in `processAssets` ([#12486](https://github.com/webpack/webpack/issues/12486)).

## Dependency, Module, Factory

- **Map every Dependency class to a factory and a template.** Register `compilation.dependencyFactories.set(Dep, factory)` and `compilation.dependencyTemplates.set(Dep, new Dep.Template())`. [ContainerReferencePlugin.js#L84][v-crp84].
- **Attach the template as a static class field.** `Dep.Template = class extends NullDependency.Template { apply(dep, source, { runtimeRequirements, initFragments, chunkGraph, module }) }`. In `apply`, add requirements and InitFragments, never inline runtime. [ModuleDecoratorDependency.js#L99][v-mdd99].
- **Wire parser-created dependencies the same way every time.** In a parser hook: create the dep, set `dep.loc = expr.loc`, call `module.addPresentationalDependency(dep)`, and `return true`. [APIPlugin.js#L177][v-api177].
- **Custom Modules implement a fixed surface.**
  - `identifier()` includes everything that affects output, including the layer. `readableIdentifier()` and `libIdent()` complete the naming methods.
  - `needBuild` is `cb(null, !this.buildInfo)`.
  - `build()` sets `buildMeta`/`buildInfo`, calls `clearDependenciesAndBlocks()`, then adds dependencies.
  - Also implement `size()`, `getSourceTypes()` (returning a hoisted constant Set), and `nameForCondition()`.
  - `codeGeneration()` returns `{ sources, data, runtimeRequirements }`.

  See [RemoteModule.js#L39][v-rm39] and [ConsumeSharedModule.js#L60][v-csm60].
- **Pass module data to the runtime through custom source types or codegen `data`** (`"share-init"`, `"consume-shared"`). Runtime modules read it with `codeGenerationResults.getData`. [RemoteModule.js#L141][v-rm141], [ShareRuntimeModule.js#L41][v-srm41].

## Runtime

- **Emit runtime code only through the requirement pipeline.** Add a `RuntimeGlobals` constant, add it to `runtimeRequirements`, then add the module from `compilation.hooks.runtimeRequirementInTree.for(G).tap(PLUGIN_NAME, (chunk, set) => { set.add(dep); compilation.addRuntimeModule(chunk, new XRuntimeModule()); return true; })`. [RuntimePlugin.js#L142][v-rp142], [ContainerReferencePlugin.js#L127][v-crp127].
- **Declare transitive runtime needs as data tables** (`TREE_DEPENDENCIES`, `MODULE_DEPENDENCIES`). [RuntimePlugin.js#L75][v-rp75].
- **Structure RuntimeModules the same way every time.** Call `super("name", RuntimeModule.STAGE_*)` and build `generate()` from `Template.asString`/`Template.indent` and `runtimeTemplate.basicFunction`/`returningFunction`. Read the graph from `this.compilation` and `this.chunkGraph`. Set `fullHash`/`dependentHash` when output depends on hashes. [RemoteRuntimeModule.js#L47][v-rrm47], [RuntimeModule.js#L196][v-rtm196].
- **Keep large static runtime in `*.runtime.js` files**, loaded with `Template.getFunctionContent(require(...))`. Use this only for chunk loading and HMR; generate everything else. [HotModuleReplacementRuntimeModule.js#L20][v-hmr20].
- **Keep the runtime free of globals.** Use `RuntimeGlobals.*` rather than literal `__webpack_require__.x` ([#8983](https://github.com/webpack/webpack/pull/8983), [#12887](https://github.com/webpack/webpack/pull/12887)). The script tag is the only shared state allowed ([#9979](https://github.com/webpack/webpack/pull/9979)).

## Caching, serialization, determinism

- **Make every cached class serializable.** Call `makeSerializable(Class, "webpack/lib/<path>")` and register the class in `lib/util/internalSerializables.js`. `serialize` writes fields in order and then calls `super.serialize(context)`. `deserialize` reads them in the same order. [RemoteModule.js#L152][v-rm152], [internalSerializables.js#L31][v-is31]. Subclasses must serialize their own new fields ([#10491](https://github.com/webpack/webpack/pull/10491)).
- **Cache plugin results through `compilation.getCache("Plugin|sub")`.** Build the etag with `mergeEtags(getLazyHashedEtag(source), …)` and use `providePromise`. [RealContentHashPlugin.js#L130][v-rch130].
- **Compute `updateHash` input once** and store it in `this._hashUpdate` ([381614aec](https://github.com/webpack/webpack/commit/381614aec)). Never return an old hash, and skip hashing default values ([#12642](https://github.com/webpack/webpack/pull/12642), [#14857](https://github.com/webpack/webpack/pull/14857)).
- **Sort output deterministically.** Use hoisted comparators (`compareStrings`, `compareModulesByIdentifier`, `concatComparators`). [23f922bed](https://github.com/webpack/webpack/commit/23f922bed) made Module Federation bundles stable.
- **Keep per-compilation state in a `WeakMap`.** `getCompilationHooks` guards its argument with `instanceof Compilation`. [RealContentHashPlugin.js#L95][v-rch95], [224ed2ac0](https://github.com/webpack/webpack/commit/224ed2ac0). Modules must not retain a Compilation ([#13127](https://github.com/webpack/webpack/issues/13127)).
- **Refuse changes that trade away determinism.** An automatic hash-algorithm fallback was rejected for exactly that reason ([#14532](https://github.com/webpack/webpack/issues/14532)).

## Performance

- **Lazy-require heavy modules.** Use a module-level `const getX = memoize(() => require("./X"))`, never Proxy tricks, because webpack must be able to bundle itself ([4845915c0](https://github.com/webpack/webpack/commit/4845915c0), [#10070](https://github.com/webpack/webpack/pull/10070)).
- **Keep hot paths lean.** Do a single `get` and compare to `undefined`, build string keys by concatenation, use counting APIs (`getNumberOfModuleChunks(m) > 0`), and keep validation out of per-module paths ([#9984](https://github.com/webpack/webpack/pull/9984), [#10953](https://github.com/webpack/webpack/pull/10953), [#14325](https://github.com/webpack/webpack/pull/14325)).
- **Use lazy and sortable sets.** `LazySet` holds file, context, and missing dependencies, `SortableSet` holds sorted sets, and constant Sets are shared ([522d80f33](https://github.com/webpack/webpack/commit/522d80f33)).
- **Memoize derived data inside hooks** so it is only computed when a branch needs it. [SplitChunksPlugin.js#L847][v-scp847].
- **Cache derived objects in WeakMaps** keyed by their input (`cachedCleverMerge`), and create RegExps once ([#12927](https://github.com/webpack/webpack/pull/12927), [#14247](https://github.com/webpack/webpack/pull/14247)).
- **Measure performance changes.** "Please measure, when doing performance related changes." ([#8592](https://github.com/webpack/webpack/pull/8592)). Time long phases with `compilation.getLogger("webpack.X").time()`.

## Options, deprecation, errors

- **A new option lands as one change** covering the schema with descriptions, defaults (`F()`/`D()` in `lib/config/defaults.js`), normalization, generated declarations and types, the Defaults test, and the CLI snapshot ([16784692d](https://github.com/webpack/webpack/commit/16784692d), [#13925](https://github.com/webpack/webpack/pull/13925)).
- **Deprecate before removing.** Keep a `util.deprecate(fn, msg, "DEP_WEBPACK_<AREA>_<NAME>")` shim hoisted to module scope, marked `// TODO webpack 6`. [Module.js#L177][v-m177]. Add the replacement option in the same PR ([#12845](https://github.com/webpack/webpack/pull/12845)).
- **Put behavior changes behind flags.** Use `experiments.*` first, then a dedicated "enable by default" PR ([#11413](https://github.com/webpack/webpack/pull/11413)). Breaking defaults go under `futureDefaults` ([#14653](https://github.com/webpack/webpack/pull/14653)).
- **Report diagnostics as `WebpackError` subclasses.** Each sets `name` and `hideStack`/`loc` and is serializable. [ConsumeSharedPlugin.js#L141][v-csp141]. Unsupported syntax gets a warning plus a safe fallback value ([#11075](https://github.com/webpack/webpack/pull/11075)).

## Module Federation positions

- **Give every container a distinct `uniqueName`, and run one runtime per page** ([#12194](https://github.com/webpack/webpack/issues/12194), [#13152](https://github.com/webpack/webpack/issues/13152)).
- **Infer `requiredVersion` from the nearest package.json** instead of hardcoding it ([#15971](https://github.com/webpack/webpack/issues/15971)). Treat `eager` as an edge case ([#15164](https://github.com/webpack/webpack/issues/15164)).
- **Remotes change independently of the host.** That is why exposes can't be tree-shaken and why integrity checks happen at runtime ([#14310](https://github.com/webpack/webpack/issues/14310)).
- **To separate sharing, use a different `shareKey`, not another share scope** ([#13834](https://github.com/webpack/webpack/issues/13834)). Lazily loaded remotes call `container.init(__webpack_share_scopes__.default)` ([#13896](https://github.com/webpack/webpack/issues/13896)).
- **Customize through existing runtime hooks** (`__webpack_get_script_filename__`, `__webpack_chunk_load__`) before adding options ([#12834](https://github.com/webpack/webpack/issues/12834), [#13735](https://github.com/webpack/webpack/issues/13735)).

## Tests

- **A config case is a directory.** `test/configCases/<area>/<case>/` holds `webpack.config.js`, typed with `/** @type {import("../../../../").Configuration} */`, and `index.js` with `it(...)` blocks. Add `errors.js`, `warnings.js`, and `deprecations.js` (arrays of regexps) as needed. A feature often lands in one commit with its plugin, module, runtime module, schema, types, and config case ([1b3246361](https://github.com/webpack/webpack/commit/1b3246361)).
- **Tests are blocking.** He blocked PRs that answered "not needed" to the tests question ([#12831](https://github.com/webpack/webpack/pull/12831), [#10646](https://github.com/webpack/webpack/pull/10646)).
- **A fix must cover its siblings.** ExternalModule as well as UMD, every RuntimeModule, and non-main chunks ([#11565](https://github.com/webpack/webpack/pull/11565), [#9119](https://github.com/webpack/webpack/pull/9119), [#11395](https://github.com/webpack/webpack/pull/11395)).

[v-cp]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/container/ContainerPlugin.js#L17
[v-cp88]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/container/ContainerPlugin.js#L88
[v-csp55]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/sharing/ConsumeSharedPlugin.js#L55
[v-csp141]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/sharing/ConsumeSharedPlugin.js#L141
[v-csp254]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/sharing/ConsumeSharedPlugin.js#L254
[v-psp189]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/sharing/ProvideSharedPlugin.js#L189
[v-api177]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/APIPlugin.js#L177
[v-api239]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/APIPlugin.js#L239
[v-scp798]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/optimize/SplitChunksPlugin.js#L798
[v-scp847]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/optimize/SplitChunksPlugin.js#L847
[v-crp84]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/container/ContainerReferencePlugin.js#L84
[v-crp127]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/container/ContainerReferencePlugin.js#L127
[v-mdd99]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/dependencies/ModuleDecoratorDependency.js#L99
[v-rm39]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/container/RemoteModule.js#L39
[v-rm141]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/container/RemoteModule.js#L141
[v-rm152]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/container/RemoteModule.js#L152
[v-csm60]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/sharing/ConsumeSharedModule.js#L60
[v-srm41]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/sharing/ShareRuntimeModule.js#L41
[v-rp75]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/RuntimePlugin.js#L75
[v-rp142]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/RuntimePlugin.js#L142
[v-rrm47]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/container/RemoteRuntimeModule.js#L47
[v-rtm196]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/RuntimeModule.js#L196
[v-hmr20]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/hmr/HotModuleReplacementRuntimeModule.js#L20
[v-is31]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/util/internalSerializables.js#L31
[v-rch95]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/optimize/RealContentHashPlugin.js#L95
[v-rch130]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/optimize/RealContentHashPlugin.js#L130
[v-m177]: https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/Module.js#L177
