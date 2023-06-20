"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildFederationPlugin = void 0;
const tslib_1 = require("tslib");
const webpack_1 = require("webpack");
const node_1 = require("@module-federation/node");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const nextPageMapLoader_1 = require("../loaders/nextPageMapLoader");
const helpers_1 = require("../loaders/helpers");
const internal_1 = require("../internal");
const utilities_1 = require("@module-federation/utilities");
const build_utils_1 = require("../../utils/build-utils");
const ModuleFederationPlugin_1 = tslib_1.__importDefault(require("./ModuleFederationPlugin"));
const RemoveRRRuntimePlugin_1 = tslib_1.__importDefault(require("./RemoveRRRuntimePlugin"));
const AddRuntimeRequirementToPromiseExternalPlugin_1 = tslib_1.__importDefault(require("./AddRuntimeRequirementToPromiseExternalPlugin"));
const CHILD_PLUGIN_NAME = 'ChildFederationPlugin';
const childCompilers = {};
class ChildFederationPlugin {
    constructor(options, extraOptions) {
        this._options = options;
        this._extraOptions = extraOptions;
        this.initalRun = false;
    }
    apply(compiler) {
        const webpack = compiler.webpack;
        const LibraryPlugin = webpack.library.EnableLibraryPlugin;
        const LoaderTargetPlugin = webpack.LoaderTargetPlugin;
        const library = compiler.options.output.library;
        const isServer = compiler.options.name === 'server';
        const isDev = compiler.options.mode === 'development';
        let outputPath;
        if (isDev && isServer) {
            outputPath = path_1.default.join((0, internal_1.getOutputPath)(compiler), 'static/ssr');
        }
        else {
            if (isServer) {
                outputPath = path_1.default.join((0, internal_1.getOutputPath)(compiler), 'static/ssr');
            }
            else {
                outputPath = compiler.options.output.path;
            }
        }
        compiler.hooks.thisCompilation.tap(CHILD_PLUGIN_NAME, (compilation) => {
            let plugins = [];
            const buildName = this._options.name;
            // using ModuleFederationPlugin does not work, i had to fork because of afterPlugins hook on containerPlugin.
            const FederationPlugin = ModuleFederationPlugin_1.default;
            const MedusaPlugin = compiler.options.plugins.find((p) => {
                return p.constructor.name === 'NextMedusaPlugin';
            });
            let uniqueName = buildName;
            if (MedusaPlugin && compiler.options.output.uniqueName !== '_N_E') {
                uniqueName = compiler.options.output.uniqueName;
            }
            const childOutput = {
                ...compiler.options.output,
                path: outputPath,
                // path: deriveOutputPath(isServer, compiler.options.output.path),
                name: 'child-' + compiler.options.name,
                publicPath: 'auto',
                chunkLoadingGlobal: uniqueName + 'chunkLoader',
                uniqueName: uniqueName,
                library: {
                    name: buildName,
                    type: library?.type,
                },
                // chunkFilename: (
                //   compiler.options.output.chunkFilename as string
                // )?.replace('.js', isDev ? '-fed.js' : '[contenthash]-fed.js'),
                // filename: (compiler.options.output.filename as string)?.replace(
                //   '.js',
                //   isDev ? '-fed.js' : '[contenthash]-fed.js'
                // ),
                //TODO: find a better solution for dev mode thats not as slow as hashing the chunks.
                chunkFilename: compiler.options.output.chunkFilename?.replace('.js', '-[contenthash]-fed.js'),
                filename: compiler.options.output.filename?.replace('.js', '-[contenthash]-fed.js'),
            };
            const federationPluginOptions = {
                // library: {type: 'var', name: buildName},
                ...this._options,
                name: MedusaPlugin
                    ? '__REMOTE_VERSION__' + this._options.name
                    : this._options.name,
                library: {
                    type: this._options.library?.type,
                    name: MedusaPlugin
                        ? '__REMOTE_VERSION__' + this._options.name
                        : this._options.name,
                },
                filename: (0, build_utils_1.computeRemoteFilename)(isServer, this._options.filename),
                exposes: {
                    // in development we do not hash chunks, so we need some way to cache bust the server container when remote changes
                    // in prod we hash the chunk so we can use [contenthash] which changes the overall hash of the remote container
                    // doesnt work as intended for dev mode
                    ...this._options.exposes,
                    ...(this._extraOptions.exposePages
                        ? (0, nextPageMapLoader_1.exposeNextjsPages)(compiler.options.context)
                        : {}),
                },
                runtime: false,
                shared: {
                    ...(this._extraOptions.skipSharingNextInternals
                        ? {}
                        : internal_1.externalizedShares),
                    ...this._options.shared,
                },
            };
            if (compiler.options.name === 'client') {
                plugins = [
                    new webpack.EntryPlugin(compiler.context, require.resolve('../internal-delegate-hoist'), federationPluginOptions.name),
                    new FederationPlugin(federationPluginOptions),
                    new webpack.web.JsonpTemplatePlugin(),
                    new LoaderTargetPlugin('web'),
                    new LibraryPlugin(this._options.library?.type),
                    new webpack.DefinePlugin({
                        'process.env.REMOTES': (0, utilities_1.createRuntimeVariables)(this._options.remotes),
                        'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
                    }),
                    new AddRuntimeRequirementToPromiseExternalPlugin_1.default(),
                ];
            }
            else if (compiler.options.name === 'server') {
                const { StreamingTargetPlugin, NodeFederationPlugin, } = require('@module-federation/node');
                plugins = [
                    new webpack.EntryPlugin(compiler.context, require.resolve('../internal-delegate-hoist'), federationPluginOptions.name),
                    new NodeFederationPlugin(federationPluginOptions, {
                        ModuleFederationPlugin: FederationPlugin,
                    }),
                    new webpack.node.NodeTemplatePlugin(childOutput),
                    //TODO: Externals function needs to internalize any shared module for host and remote build
                    new webpack.ExternalsPlugin(compiler.options.externalsType, [
                        // next dynamic needs to be within webpack, cannot be externalized
                        ...Object.keys(internal_1.DEFAULT_SHARE_SCOPE).filter((k) => k !== 'next/dynamic' && k !== 'next/link' && k !== 'next/script'),
                        'react/jsx-runtime',
                        'react/jsx-dev-runtime',
                    ]),
                    // new LoaderTargetPlugin('async-node'),
                    new StreamingTargetPlugin(federationPluginOptions, {
                        ModuleFederationPlugin: webpack.container.ModuleFederationPlugin,
                    }),
                    new LibraryPlugin(federationPluginOptions.library?.type),
                    // new webpack.DefinePlugin({
                    //   'process.env.REMOTES': JSON.stringify(this._options.remotes),
                    //   'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
                    // }),
                    new AddRuntimeRequirementToPromiseExternalPlugin_1.default(),
                ];
            }
            const childCompiler = compilation.createChildCompiler(CHILD_PLUGIN_NAME, childOutput, plugins);
            if (!isServer) {
                new node_1.ChunkCorrelationPlugin({
                    filename: 'static/ssr/federated-stats.json',
                }).apply(childCompiler);
            }
            childCompiler.outputPath = outputPath;
            childCompiler.options.module.rules.forEach((rule) => {
                // next-image-loader fix which adds remote's hostname to the assets url
                if (this._extraOptions.enableImageLoaderFix &&
                    (0, helpers_1.hasLoader)(rule, 'next-image-loader')) {
                    // childCompiler.options.module.parser.javascript?.url = 'relative';
                    (0, helpers_1.injectRuleLoader)(rule, {
                        loader: path_1.default.resolve(__dirname, '../loaders/fixImageLoader'),
                    });
                }
                // url-loader fix for which adds remote's hostname to the assets url
                if (this._extraOptions.enableUrlLoaderFix &&
                    (0, helpers_1.hasLoader)(rule, 'url-loader')) {
                    (0, helpers_1.injectRuleLoader)({
                        loader: path_1.default.resolve(__dirname, '../loaders/fixUrlLoader'),
                    });
                }
            });
            childCompiler.options.experiments.lazyCompilation = false;
            childCompiler.options.optimization.runtimeChunk = false;
            childCompiler.outputFileSystem = fs_1.default;
            // no custom chunk splitting should be derived from host (next)
            delete childCompiler.options.optimization.splitChunks;
            if (compiler.options.optimization.minimize &&
                compiler.options.optimization.minimizer) {
                for (const minimizer of compiler.options.optimization.minimizer) {
                    if (typeof minimizer === 'function') {
                        minimizer.call(childCompiler, childCompiler);
                    }
                    else if (minimizer !== '...') {
                        minimizer.apply(childCompiler);
                    }
                }
            }
            new RemoveRRRuntimePlugin_1.default().apply(childCompiler);
            // TODO: Provide better types for MiniCss Plugin for ChildCompiler in ChildFederationPlugin
            const MiniCss = childCompiler.options.plugins.find((p) => {
                return p.constructor.name === 'NextMiniCssExtractPlugin';
            });
            if (MedusaPlugin) {
                //@ts-ignore
                new MedusaPlugin.constructor({
                    //@ts-ignore
                    ...MedusaPlugin._options,
                    filename: compiler.options.name + '-dashboard-child.json',
                }).apply(childCompiler);
            }
            childCompiler.options.plugins = childCompiler.options.plugins.filter((plugin) => !internal_1.removePlugins.includes(plugin.constructor.name));
            if (MiniCss) {
                // grab mini-css and reconfigure it to avoid conflicts with host
                new MiniCss.constructor({
                    ...MiniCss.options,
                    filename: MiniCss.options.filename.replace('.css', '-fed.css'),
                    chunkFilename: MiniCss.options.chunkFilename.replace('.css', '-fed.css'),
                }).apply(childCompiler);
            }
            // cache the serer compiler instance, we will run the server child compiler during the client main compilation
            // we need to do this because i need access to data from the client build to inject into the server build
            // in prod builds, server build runs first, followed by client build
            // in dev, client build runs first, followed by server build
            if (compiler.options.name) {
                childCompilers[compiler.options.name] = childCompiler;
            }
            if (isDev) {
                const compilerWithCallback = (watchOptions, callback) => {
                    if (childCompiler.watch && isServer) {
                        if (!this.watching) {
                            this.watching = true;
                            childCompiler.watch(watchOptions, callback);
                        }
                    }
                    else {
                        childCompiler.run(callback);
                    }
                };
                const compilerCallback = (err, stats) => {
                    //workaround due to watch mode not running unless youve hit a page on the remote itself
                    if (isServer && isDev && childCompilers['client']) {
                        childCompilers['client'].run((err, stats) => {
                            if (err) {
                                compilation.errors.push(err);
                            }
                            if (stats && stats.hasErrors()) {
                                compilation.errors.push(new Error((0, internal_1.toDisplayErrors)(stats.compilation.errors)));
                            }
                        });
                    }
                    if (err) {
                        compilation.errors.push(err);
                    }
                    if (stats && stats.hasErrors()) {
                        compilation.errors.push(new Error((0, internal_1.toDisplayErrors)(stats.compilation.errors)));
                    }
                };
                compilerWithCallback(compiler.options.watchOptions, compilerCallback);
                // in prod, if client
            }
            else if (!isServer) {
                // if ssr enabled and server in compiler cache
                if (childCompilers['server']) {
                    //wrong hook for this
                    // add hook for additional assets to prevent compile from sealing.
                    compilation.hooks.processAssets.tapPromise({
                        name: CHILD_PLUGIN_NAME,
                        stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_REPORT,
                    }, () => {
                        return new Promise((res, rej) => {
                            // run server child compilation during client main compilation
                            childCompilers['server'].run((err, stats) => {
                                if (err) {
                                    compilation.errors.push(err);
                                    rej();
                                }
                                if (stats && stats.hasWarnings()) {
                                    compilation.warnings.push(new Error((0, internal_1.toDisplayErrors)(stats.compilation.warnings)));
                                }
                                if (stats && stats.hasErrors()) {
                                    compilation.errors.push(new Error((0, internal_1.toDisplayErrors)(stats.compilation.errors)));
                                    rej();
                                }
                                res();
                            });
                        });
                    });
                }
                // run client child compiler like normal
                childCompiler.run((err, stats) => {
                    if (err) {
                        compilation.errors.push(err);
                    }
                    if (stats && stats.hasWarnings()) {
                        compilation.warnings.push(new Error((0, internal_1.toDisplayErrors)(stats.compilation.warnings)));
                    }
                    if (stats && stats.hasErrors()) {
                        compilation.errors.push(new Error((0, internal_1.toDisplayErrors)(stats.compilation.errors)));
                    }
                });
            }
        });
    }
}
exports.ChildFederationPlugin = ChildFederationPlugin;
exports.default = ChildFederationPlugin;
//# sourceMappingURL=ChildFederationPlugin.js.map