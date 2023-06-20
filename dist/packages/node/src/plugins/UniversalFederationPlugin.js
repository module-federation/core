"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const StreamingTargetPlugin_1 = tslib_1.__importDefault(require("./StreamingTargetPlugin"));
const NodeFederationPlugin_1 = tslib_1.__importDefault(require("./NodeFederationPlugin"));
class UniversalFederationPlugin {
    constructor(options, context) {
        this._options = options || {};
        this.context = context || {};
    }
    apply(compiler) {
        const { isServer, verbose, ...options } = this._options;
        const { webpack } = compiler;
        if (isServer || compiler.options.name === 'server') {
            new NodeFederationPlugin_1.default(options, this.context).apply(compiler);
            new StreamingTargetPlugin_1.default({ ...options, verbose }).apply(compiler);
        }
        else {
            new (this.context.ModuleFederationPlugin ||
                (webpack && webpack.container.ModuleFederationPlugin) ||
                require('webpack/lib/container/ModuleFederationPlugin'))(options).apply(compiler);
        }
    }
}
exports.default = UniversalFederationPlugin;
//# sourceMappingURL=UniversalFederationPlugin.js.map