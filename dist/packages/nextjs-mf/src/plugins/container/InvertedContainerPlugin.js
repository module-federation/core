"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const webpack_sources_1 = require("webpack-sources");
const InvertedContainerRuntimeModule_1 = tslib_1.__importDefault(require("./InvertedContainerRuntimeModule"));
const webpack_1 = require("webpack");
const RemoveEagerModulesFromRuntimePlugin_1 = tslib_1.__importDefault(require("./RemoveEagerModulesFromRuntimePlugin"));
/**
 * InvertedContainerPlugin is a Webpack plugin that handles loading of chunks in a federated module.
 */
class InvertedContainerPlugin {
    /**
     * Constructor for the InvertedContainerPlugin.
     * @param {InvertedContainerOptions} options - Plugin configuration options.
     */
    constructor(options) {
        this.options = options || {};
    }
    /**
     * Resolves the container module for the given compilation.
     * @param {Compilation} compilation - Webpack compilation instance.
     * @returns {Module | undefined} - The container module or undefined if not found.
     */
    resolveContainerModule(compilation) {
        if (!this.options.container) {
            return undefined;
        }
        const container = compilation.entrypoints
            .get(this.options.container)
            ?.getRuntimeChunk?.();
        if (!container)
            return undefined;
        const entrymodule = compilation.chunkGraph.getChunkEntryModulesIterable(container);
        for (const module of entrymodule) {
            return module;
        }
        return undefined;
    }
    /**
     * Apply method for the Webpack plugin, handling the plugin logic and hooks.
     * @param {Compiler} compiler - Webpack compiler instance.
     */
    apply(compiler) {
        new RemoveEagerModulesFromRuntimePlugin_1.default({
            container: this.options.container,
            debug: this.options.debug,
        }).apply(compiler);
        const { Template, javascript } = compiler.webpack;
        // Hook into the compilation process.
        compiler.hooks.thisCompilation.tap('InvertedContainerPlugin', (compilation) => {
            // Create a WeakSet to store chunks that have already been processed.
            const onceForChunkSet = new WeakSet();
            // Define a handler function to be called for each chunk in the compilation.
            const handler = (chunk, set) => {
                // If the chunk has already been processed, skip it.
                if (onceForChunkSet.has(chunk))
                    return;
                set.add(webpack_1.RuntimeGlobals.onChunksLoaded);
                // Mark the chunk as processed by adding it to the WeakSet.
                onceForChunkSet.add(chunk);
                if (chunk.hasRuntime()) {
                    // Add an InvertedContainerRuntimeModule to the chunk, which handles
                    // the runtime logic for loading remote modules.
                    compilation.addRuntimeModule(chunk, new InvertedContainerRuntimeModule_1.default(set, this.options, {
                        webpack: compiler.webpack,
                        debug: this.options.debug,
                    }));
                }
            };
            compilation.hooks.additionalChunkRuntimeRequirements.tap('InvertedContainerPlugin', handler);
            compilation.hooks.optimizeChunks.tap('InvertedContainerPlugin', (chunks) => {
                const containerEntryModule = this.resolveContainerModule(compilation);
                if (!containerEntryModule)
                    return;
                for (const chunk of chunks) {
                    if (!compilation.chunkGraph.isModuleInChunk(containerEntryModule, chunk) &&
                        chunk.hasRuntime()) {
                        compilation.chunkGraph.connectChunkAndModule(chunk, containerEntryModule);
                    }
                }
            });
            const hooks = javascript.JavascriptModulesPlugin.getCompilationHooks(compilation);
            compilation.hooks.processAssets.tap({
                name: 'InvertedContainerPlugin',
                stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
            }, (assets) => {
                for (const chunk of compilation.chunks) {
                    for (const file of chunk.files) {
                        const asset = compilation.getAsset(file);
                        if (asset) {
                            let source = asset.source.source();
                            const chunkID = typeof chunk.id === 'string'
                                ? JSON.stringify(chunk.id)
                                : chunk.id;
                            // Inject the chunk name at the beginning of the file
                            source = source
                                .toString()
                                //@ts-ignore
                                .replace('__INSERT_CH_ID__MF__', chunkID);
                            const updatedSource = new webpack_sources_1.RawSource(source);
                            //@ts-ignore
                            compilation.updateAsset(file, updatedSource);
                        }
                    }
                }
            });
            hooks.renderStartup.tap('InvertedContainerPlugin', 
            //@ts-ignore
            (source, renderContext) => {
                if (!renderContext ||
                    //@ts-ignore
                    renderContext?._name ||
                    !renderContext?.debugId ||
                    !compilation.chunkGraph.isEntryModule(renderContext)) {
                    // skip empty modules, container entry, and anything that doesnt have a moduleid or is not an entrypoint module.
                    return source;
                }
                const { runtimeTemplate } = compilation;
                const replaceSource = source.source().toString().split('\n');
                const searchString = '__webpack_exec__';
                const replaceString = '__webpack_exec_proxy__';
                const originalExec = replaceSource.findIndex((s) => s.includes(searchString));
                if (originalExec === -1) {
                    return source;
                }
                const firstHalf = replaceSource.slice(0, originalExec + 1);
                const secondHalf = replaceSource.slice(originalExec + 1, replaceSource.length);
                const originalRuntimeCode = firstHalf
                    .join('\n')
                    .replace(searchString, replaceString);
                const fancyTemplate = Template.asString([
                    runtimeTemplate.returningFunction(Template.asString([
                        '__webpack_require__.own_remote.then(',
                        runtimeTemplate.returningFunction(Template.asString([
                            'Promise.all([',
                            Template.indent([
                                'Promise.all(__webpack_require__.initRemotes)',
                                'Promise.all(__webpack_require__.initConsumes)',
                            ].join(',\n')),
                            '])',
                        ])),
                        ').then(',
                        runtimeTemplate.returningFunction(Template.asString([`${replaceString}(moduleId)`])),
                        ')',
                    ].join('')), 'moduleId'),
                ]);
                const wholeTem = Template.asString([
                    `var ${searchString} =`,
                    fancyTemplate,
                ]);
                return Template.asString([
                    '',
                    'var currentChunkId = __INSERT_CH_ID__MF__;',
                    `if(currentChunkId) {`,
                    Template.indent([
                        `if(__webpack_require__.getEagerSharedForChunkId) {__webpack_require__.getEagerSharedForChunkId(currentChunkId,__webpack_require__.initConsumes)}`,
                        `if(__webpack_require__.getEagerRemotesForChunkId) {__webpack_require__.getEagerRemotesForChunkId(currentChunkId,__webpack_require__.initRemotes)}`,
                    ]),
                    '}',
                    originalRuntimeCode,
                    wholeTem,
                    ...secondHalf,
                    '',
                ]);
            });
        });
    }
}
exports.default = InvertedContainerPlugin;
//# sourceMappingURL=InvertedContainerPlugin.js.map