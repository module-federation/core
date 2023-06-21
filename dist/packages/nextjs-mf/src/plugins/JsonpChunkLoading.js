"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const webpack_sources_1 = require("webpack-sources");
const Template_1 = tslib_1.__importDefault(require("../../utils/Template"));
const custom_jsonp_1 = tslib_1.__importDefault(require("./container/custom-jsonp"));
function getCustomJsonpCode(chunkLoadingGlobal, RuntimeGlobals) {
    const code = [
        'var chunkQueue = [];',
        'var chunkTracker = [];',
        `var chunkLoadingGlobal = self[${JSON.stringify(chunkLoadingGlobal)}] || [];`,
        'var asyncQueue = [];',
        custom_jsonp_1.default,
    ];
    return Template_1.default.asString(code);
}
class CustomWebpackPlugin {
    constructor(options) {
        this.options = options || {};
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('CustomWebpackPlugin', (compilation) => {
            compilation.hooks.runtimeModule.tap('CustomWebpackPlugin', (runtimeModule, chunk) => {
                if (this.options.server && chunk.name === 'webpack-runtime') {
                    // if server runtime module
                }
                if (runtimeModule.constructor.name ===
                    'JsonpChunkLoadingRuntimeModule' &&
                    chunk.name === 'webpack') {
                    const originalSource = runtimeModule.getGeneratedCode();
                    const modifiedSource = new webpack_sources_1.ConcatSource(originalSource, '\n', getCustomJsonpCode(
                    //@ts-ignore
                    compilation.outputOptions.chunkLoadingGlobal, compiler.webpack.RuntimeGlobals));
                    runtimeModule.getGeneratedCode = () => modifiedSource.source();
                }
            });
        });
    }
}
exports.default = CustomWebpackPlugin;
//# sourceMappingURL=JsonpChunkLoading.js.map