"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FederatedTypesStatsPlugin", {
    enumerable: true,
    get: function() {
        return FederatedTypesStatsPlugin;
    }
});
const _webpack = require("webpack");
const _generateTypesStats = require("../lib/generateTypesStats");
const PLUGIN_NAME = 'FederatedTypesStatsPlugin';
let FederatedTypesStatsPlugin = class FederatedTypesStatsPlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation, params)=>{
            const federatedTypesMap = params.federated_types;
            compilation.hooks.processAssets.tap({
                name: PLUGIN_NAME,
                stage: _webpack.Compilation.PROCESS_ASSETS_STAGE_ANALYSE
            }, ()=>{
                const { typesIndexJsonFilePath , publicPath  } = this.options;
                const statsJson = {
                    publicPath,
                    files: (0, _generateTypesStats.generateTypesStats)(federatedTypesMap, this.options)
                };
                const source = new _webpack.sources.RawSource(JSON.stringify(statsJson));
                const asset = compilation.getAsset(typesIndexJsonFilePath);
                if (asset) {
                    compilation.updateAsset(typesIndexJsonFilePath, source);
                } else {
                    compilation.emitAsset(typesIndexJsonFilePath, source);
                }
            });
        });
    }
    constructor(options){
        this.options = options;
    }
};

//# sourceMappingURL=FederatedTypesStatsPlugin.js.map