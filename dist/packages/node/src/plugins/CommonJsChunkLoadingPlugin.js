"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const RuntimeGlobals_1 = tslib_1.__importDefault(require("webpack/lib/RuntimeGlobals"));
const StartupChunkDependenciesPlugin_1 = tslib_1.__importDefault(require("webpack/lib/runtime/StartupChunkDependenciesPlugin"));
const LoadFileChunkLoadingRuntimeModule_1 = tslib_1.__importDefault(require("./LoadFileChunkLoadingRuntimeModule"));
class CommonJsChunkLoadingPlugin {
    constructor(options) {
        this.options = options || {};
        this._asyncChunkLoading = this.options.asyncChunkLoading;
    }
    apply(compiler) {
        const chunkLoadingValue = this._asyncChunkLoading
            ? 'async-node'
            : 'require';
        new StartupChunkDependenciesPlugin_1.default({
            chunkLoading: chunkLoadingValue,
            asyncChunkLoading: this._asyncChunkLoading,
        }).apply(compiler);
        compiler.hooks.thisCompilation.tap('CommonJsChunkLoadingPlugin', (compilation) => {
            // Always enabled
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const isEnabledForChunk = (_) => true;
            const onceForChunkSet = new WeakSet();
            const handler = (chunk, set) => {
                if (onceForChunkSet.has(chunk))
                    return;
                onceForChunkSet.add(chunk);
                if (!isEnabledForChunk(chunk))
                    return;
                set.add(RuntimeGlobals_1.default.moduleFactoriesAddOnly);
                set.add(RuntimeGlobals_1.default.hasOwnProperty);
                compilation.addRuntimeModule(chunk, new LoadFileChunkLoadingRuntimeModule_1.default(set, this.options, {
                    webpack: compiler.webpack,
                }));
            };
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.ensureChunkHandlers)
                .tap('CommonJsChunkLoadingPlugin', handler);
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.hmrDownloadUpdateHandlers)
                .tap('CommonJsChunkLoadingPlugin', handler);
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.hmrDownloadManifest)
                .tap('CommonJsChunkLoadingPlugin', handler);
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.baseURI)
                .tap('CommonJsChunkLoadingPlugin', handler);
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.externalInstallChunk)
                .tap('CommonJsChunkLoadingPlugin', handler);
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.onChunksLoaded)
                .tap('CommonJsChunkLoadingPlugin', handler);
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.ensureChunkHandlers)
                .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
                if (!isEnabledForChunk(chunk))
                    return;
                set.add(RuntimeGlobals_1.default.getChunkScriptFilename);
            });
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.hmrDownloadUpdateHandlers)
                .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
                if (!isEnabledForChunk(chunk))
                    return;
                set.add(RuntimeGlobals_1.default.getChunkUpdateScriptFilename);
                set.add(RuntimeGlobals_1.default.moduleCache);
                set.add(RuntimeGlobals_1.default.hmrModuleData);
                set.add(RuntimeGlobals_1.default.moduleFactoriesAddOnly);
            });
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals_1.default.hmrDownloadManifest)
                .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
                if (!isEnabledForChunk(chunk))
                    return;
                set.add(RuntimeGlobals_1.default.getUpdateManifestFilename);
            });
        });
    }
}
exports.default = CommonJsChunkLoadingPlugin;
//# sourceMappingURL=CommonJsChunkLoadingPlugin.js.map