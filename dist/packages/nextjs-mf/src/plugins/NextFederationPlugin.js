/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Zackary Jackson @ScriptedAlchemy
*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextFederationPlugin = void 0;
const tslib_1 = require("tslib");
const utilities_1 = require("@module-federation/utilities");
const path_1 = tslib_1.__importDefault(require("path"));
const internal_1 = require("../internal");
const AddRuntimeRequirementToPromiseExternalPlugin_1 = tslib_1.__importDefault(require("./AddRuntimeRequirementToPromiseExternalPlugin"));
const ChildFederationPlugin_1 = tslib_1.__importDefault(require("./ChildFederationPlugin"));
const DevHmrFixInvalidPongPlugin_1 = tslib_1.__importDefault(require("./DevHmrFixInvalidPongPlugin"));
// @ts-ignore
const regexEqual = (x, y) => {
    return (x instanceof RegExp &&
        y instanceof RegExp &&
        x.source === y.source &&
        x.global === y.global &&
        x.ignoreCase === y.ignoreCase &&
        x.multiline === y.multiline);
};
class NextFederationPlugin {
    constructor(options) {
        const { extraOptions, ...mainOpts } = options;
        this._options = mainOpts;
        this._extraOptions = {
            automaticPageStitching: false,
            enableImageLoaderFix: false,
            enableUrlLoaderFix: false,
            skipSharingNextInternals: false,
            automaticAsyncBoundary: false,
            ...extraOptions,
        };
    }
    apply(compiler) {
        if (!compiler.options.name) {
            throw new Error('name is not defined in Compiler options');
        }
        if (!this._options.filename) {
            throw new Error('filename is not defined in NextFederation options');
        }
        if (!['server', 'client'].includes(compiler.options.name)) {
            return;
        }
        const isServer = compiler.options.name === 'server';
        const { webpack } = compiler;
        if (isServer) {
            // target false because we use our own target for node env
            compiler.options.target = false;
            const { StreamingTargetPlugin } = require('@module-federation/node');
            new StreamingTargetPlugin(this._options, {
                ModuleFederationPlugin: webpack.container.ModuleFederationPlugin,
            }).apply(compiler);
            this._options.library = {
                type: 'commonjs-module',
                name: this._options.name,
            };
            // output remote to ssr if server
            this._options.filename = path_1.default.basename(this._options.filename);
            // should this be a plugin that we apply to the compiler?
            (0, internal_1.internalizeSharedPackages)(this._options, compiler);
            // module-federation/utilities uses internal webpack methods and must be bundled into runtime code.
            if (Array.isArray(compiler.options.externals)) {
                const originalExternals = compiler.options.externals[0];
                compiler.options.externals[0] = function (ctx, callback) {
                    if (ctx.request &&
                        (ctx.request.includes('@module-federation/utilities') ||
                            ctx.request.includes('@module-federation/dashboard-plugin'))) {
                        return callback();
                    }
                    // @ts-ignore
                    return originalExternals(ctx, callback);
                };
            }
        }
        else {
            new webpack.EntryPlugin(compiler.context, require.resolve('../internal-delegate-hoist'), 'main').apply(compiler);
            if (this._extraOptions.automaticPageStitching) {
                compiler.options.module.rules.push({
                    test: /next[\\/]dist[\\/]client[\\/]page-loader\.js$/,
                    loader: path_1.default.resolve(__dirname, '../loaders/patchNextClientPageLoader'),
                });
            }
            if (this._options.remotes) {
                this._options.remotes = (0, internal_1.parseRemotes)(this._options.remotes);
            }
            if (this._options.library) {
                console.error('[mf] you cannot set custom library');
            }
            this._options.library = {
                // assign remote name to object to avoid SWC mangling top level variable
                type: 'window',
                name: this._options.name,
            };
        }
        const allowedPaths = ['pages/', 'app/', 'src/pages/', 'src/app/'];
        //patch next
        compiler.options.module.rules.push({
            test(req) {
                if (allowedPaths.some((p) => req.includes(path_1.default.join(compiler.context, p)))) {
                    return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(req);
                }
                return false;
            },
            include: compiler.context,
            exclude: [
                /node_modules/,
                /_middleware/,
                /pages[\\/]middleware/,
                /pages[\\/]api/,
            ],
            loader: path_1.default.resolve(__dirname, '../loaders/patchDefaultSharedLoader'),
        });
        if (this._options.remotes) {
            const delegates = (0, internal_1.getDelegates)(this._options.remotes);
            // only apply loader if delegates are present
            if (delegates && Object.keys(delegates).length > 0) {
                compiler.options.module.rules.push({
                    test(req) {
                        if (isServer) {
                            // server has no common chunk or entry to hoist into
                            if (allowedPaths.some((p) => req.includes(path_1.default.join(compiler.context, p)))) {
                                return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(req);
                            }
                        }
                        if (req.includes('internal-delegate-hoist')) {
                            return true;
                        }
                        return false;
                    },
                    resourceQuery: this._extraOptions.automaticAsyncBoundary
                        ? (query) => !query.includes('hasBoundary')
                        : undefined,
                    include: [compiler.context, /internal-delegate-hoist/],
                    exclude: (request) => {
                        if (request.includes('internal-delegate-hoist')) {
                            return false;
                        }
                        return /node_modules/.test(request);
                    },
                    loader: path_1.default.resolve(__dirname, '../loaders/delegateLoader'),
                    options: {
                        delegates,
                    },
                });
            }
        }
        if (this._extraOptions.automaticAsyncBoundary) {
            const jsRules = compiler.options.module.rules.find((r) => {
                //@ts-ignore
                return r && r.oneOf;
            });
            //@ts-ignore
            if (jsRules && jsRules.oneOf) {
                //@ts-ignore
                const foundJsLayer = jsRules.oneOf.find((r) => {
                    return (regexEqual(r.test, /\.(tsx|ts|js|cjs|mjs|jsx)$/) && !r.issuerLayer);
                });
                if (foundJsLayer) {
                    let loaderChain = [];
                    if (Array.isArray(foundJsLayer.use)) {
                        loaderChain = [...foundJsLayer.use];
                    }
                    else {
                        loaderChain = [foundJsLayer.use];
                    }
                    //@ts-ignore
                    jsRules.oneOf.unshift({
                        test: (request) => {
                            if (allowedPaths.some((p) => request.includes(path_1.default.join(compiler.context, p)))) {
                                return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(request);
                            }
                            return false;
                        },
                        exclude: [
                            /node_modules/,
                            /_document/,
                            /_middleware/,
                            /pages[\\/]middleware/,
                            /pages[\\/]api/,
                        ],
                        resourceQuery: (query) => !query.includes('hasBoundary'),
                        use: [
                            ...loaderChain,
                            {
                                loader: path_1.default.resolve(__dirname, '../loaders/async-boundary-loader'),
                            },
                        ],
                    });
                }
            }
        }
        //todo runtime variable creation needs to be applied for server as well. this is just for client
        // TODO: this needs to be refactored into something more comprehensive. this is just a quick fix
        new webpack.DefinePlugin({
            'process.env.REMOTES': (0, utilities_1.createRuntimeVariables)(this._options.remotes),
            'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
        }).apply(compiler);
        const ModuleFederationPlugin = isServer
            ? require('@module-federation/node').NodeFederationPlugin
            : webpack.container.ModuleFederationPlugin;
        // ignore edge runtime and middleware builds
        if (!ModuleFederationPlugin) {
            return;
        }
        const internalShare = (0, internal_1.reKeyHostShared)(this._options.shared);
        const hostFederationPluginOptions = {
            ...this._options,
            exposes: {},
            shared: {
                noop: {
                    import: 'data:text/javascript,module.exports = {};',
                    requiredVersion: false,
                    eager: true,
                    version: '0',
                },
                ...internalShare,
            },
        };
        new ModuleFederationPlugin(hostFederationPluginOptions, {
            ModuleFederationPlugin,
        }).apply(compiler);
        new ChildFederationPlugin_1.default(this._options, this._extraOptions).apply(compiler);
        new AddRuntimeRequirementToPromiseExternalPlugin_1.default().apply(compiler);
        if (compiler.options.mode === 'development') {
            new DevHmrFixInvalidPongPlugin_1.default().apply(compiler);
        }
    }
}
exports.NextFederationPlugin = NextFederationPlugin;
exports.default = NextFederationPlugin;
//# sourceMappingURL=NextFederationPlugin.js.map