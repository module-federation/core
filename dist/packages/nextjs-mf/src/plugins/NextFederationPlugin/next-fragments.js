"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPathFixes = exports.applyRemoteDelegates = exports.retrieveDefaultShared = exports.getModuleFederationPluginConstructor = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const internal_1 = require("../../internal");
const helpers_1 = require("../../loaders/helpers");
/**
 * Gets the appropriate ModuleFederationPlugin based on the environment.
 * @param {boolean} isServer - A flag to indicate if the environment is server-side or not.
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @returns {ModuleFederationPlugin | undefined} The ModuleFederationPlugin or undefined if not applicable.
 */
function getModuleFederationPluginConstructor(isServer, compiler) {
    if (isServer) {
        return require('@module-federation/node')
            .NodeFederationPlugin;
    }
    return compiler.webpack.container
        .ModuleFederationPlugin;
}
exports.getModuleFederationPluginConstructor = getModuleFederationPluginConstructor;
/**

 Set up default shared values based on the environment.
 @param isServer - Boolean indicating if the code is running on the server.
 @returns The default share scope based on the environment.
 */
const retrieveDefaultShared = (isServer) => {
    // If the code is running on the server, treat some Next.js internals as import false to make them external
    // This is because they will be provided by the server environment and not by the remote container
    if (isServer) {
        return internal_1.DEFAULT_SHARE_SCOPE;
    }
    // If the code is running on the client/browser, always bundle Next.js internals
    return internal_1.DEFAULT_SHARE_SCOPE_BROWSER;
};
exports.retrieveDefaultShared = retrieveDefaultShared;
/**

 Apply remote delegates.

 This function adds the remote delegates feature by configuring and injecting the appropriate loader that will look
 for internal delegate hoist or delegate hoist container and load it using a custom delegateLoader.
 Once loaded, it will then look for the available delegates that will be used to configure the remote
 that the hoisted module will be dependent upon.

 @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.

 @param {Compiler} compiler - The Webpack compiler instance.
 */
function applyRemoteDelegates(options, compiler) {
    if (options.remotes) {
        // Get the available delegates
        const delegates = (0, internal_1.getDelegates)(options.remotes);
        compiler.options.module.rules.push({
            enforce: 'pre',
            test: [/_app/],
            loader: path_1.default.resolve(__dirname, '../../loaders/patchDefaultSharedLoader'),
        });
        // Add the delegate loader for hoist and container to the module rules
        compiler.options.module.rules.push({
            enforce: 'pre',
            test: [/internal-delegate-hoist/, /delegate-hoist-container/],
            include: [
                compiler.context,
                /internal-delegate-hoist/,
                /delegate-hoist-container/,
                //eslint-disable-next-line
                /next[\/]dist/,
            ],
            loader: path_1.default.resolve(__dirname, '../../loaders/delegateLoader'),
            options: {
                delegates,
            },
        });
    }
}
exports.applyRemoteDelegates = applyRemoteDelegates;
// @ts-ignore
const applyPathFixes = (compiler, options) => {
    //@ts-ignore
    compiler.options.module.rules.forEach((rule) => {
        // next-image-loader fix which adds remote's hostname to the assets url
        if (options.enableImageLoaderFix && (0, helpers_1.hasLoader)(rule, 'next-image-loader')) {
            // childCompiler.options.module.parser.javascript?.url = 'relative';
            (0, helpers_1.injectRuleLoader)(rule, {
                loader: path_1.default.resolve(__dirname, '../../loaders/fixImageLoader'),
            });
        }
        // url-loader fix for which adds remote's hostname to the assets url
        if (options.enableUrlLoaderFix && (0, helpers_1.hasLoader)(rule, 'url-loader')) {
            (0, helpers_1.injectRuleLoader)({
                loader: path_1.default.resolve(__dirname, '../../loaders/fixUrlLoader'),
            });
        }
    });
};
exports.applyPathFixes = applyPathFixes;
//# sourceMappingURL=next-fragments.js.map