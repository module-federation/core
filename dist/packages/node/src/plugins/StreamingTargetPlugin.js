"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const CommonJsChunkLoadingPlugin_1 = tslib_1.__importDefault(require("./CommonJsChunkLoadingPlugin"));
class StreamingTargetPlugin {
    constructor(options) {
        this.options = options || {};
    }
    apply(compiler) {
        if (compiler.options.target) {
            console.warn(`target should be set to false while using NodeSoftwareStreamRuntime plugin, actual target: ${compiler.options.target}`);
        }
        // When used with Next.js, context is needed to use Next.js webpack
        const { webpack } = compiler;
        // This will enable CommonJsChunkFormatPlugin
        compiler.options.output.chunkFormat = 'commonjs';
        // This will force async chunk loading
        compiler.options.output.chunkLoading = 'async-node';
        // Disable default config
        // FIXME: enabledChunkLoadingTypes is of type 'string[] | undefined'
        // Can't use the 'false' value as it isn't the right format,
        // Emptying it out ensures theres no other readFileVm added to webpack runtime
        compiler.options.output.enabledChunkLoadingTypes = [];
        compiler.options.output.environment = {
            ...compiler.options.output.environment,
            dynamicImport: true,
        };
        new (webpack?.node?.NodeEnvironmentPlugin ||
            require('webpack/lib/node/NodeEnvironmentPlugin'))({
            infrastructureLogging: compiler.options.infrastructureLogging,
        }).apply(compiler);
        new (webpack?.node?.NodeTargetPlugin ||
            require('webpack/lib/node/NodeTargetPlugin'))().apply(compiler);
        new CommonJsChunkLoadingPlugin_1.default({
            asyncChunkLoading: true,
            name: this.options.name,
            remotes: this.options.remotes,
            baseURI: compiler.options.output.publicPath,
            promiseBaseURI: this.options.promiseBaseURI,
            verbose: this.options.verbose,
        }).apply(compiler);
    }
}
exports.default = StreamingTargetPlugin;
//# sourceMappingURL=StreamingTargetPlugin.js.map