"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureServerCompilerOptions = exports.handleServerExternals = exports.configureServerLibraryAndFilename = exports.applyServerPlugins = void 0;
const tslib_1 = require("tslib");
const DelegateModulesPlugin_1 = tslib_1.__importDefault(require("@module-federation/utilities/src/plugins/DelegateModulesPlugin"));
const path_1 = tslib_1.__importDefault(require("path"));
const InvertedContainerPlugin_1 = tslib_1.__importDefault(require("../container/InvertedContainerPlugin"));
const JsonpChunkLoading_1 = tslib_1.__importDefault(require("../JsonpChunkLoading"));
/**
 * Applies server-specific plugins.
 *
 * @param compiler - The Webpack compiler instance.
 * @param options - The ModuleFederationPluginOptions instance.
 *
 */
function applyServerPlugins(compiler, options) {
    // Import the StreamingTargetPlugin from @module-federation/node
    const { StreamingTargetPlugin } = require('@module-federation/node');
    new JsonpChunkLoading_1.default({ server: true }).apply(compiler);
    new DelegateModulesPlugin_1.default({
        runtime: 'webpack-runtime',
        remotes: options.remotes,
        container: options.name,
    }).apply(compiler);
    // Add the StreamingTargetPlugin with the ModuleFederationPlugin from the webpack container
    new StreamingTargetPlugin(options, {
        ModuleFederationPlugin: compiler.webpack.container.ModuleFederationPlugin,
    }).apply(compiler);
    // Add a new commonjs chunk loading plugin to the compiler
    new InvertedContainerPlugin_1.default({
        runtime: 'webpack-runtime',
        container: options.name,
        remotes: options.remotes,
        debug: false,
    }).apply(compiler);
}
exports.applyServerPlugins = applyServerPlugins;
/**
 * Configures server-specific library and filename options.
 *
 * @param options - The ModuleFederationPluginOptions instance.
 *
 * @remarks
 * This function configures the library and filename options for server builds. The library option is
 * set to the commonjs-module format for chunks and the container, which allows them to be streamed over
 * to hosts with the NodeFederationPlugin. The filename option is set to the basename of the current
 * filename.
 */
function configureServerLibraryAndFilename(options) {
    // Configure the library option with type "commonjs-module" and the name from the options
    options.library = {
        type: 'commonjs-module',
        name: options.name,
    };
    // Set the filename option to the basename of the current filename
    options.filename = path_1.default.basename(options.filename);
}
exports.configureServerLibraryAndFilename = configureServerLibraryAndFilename;
/**
 * Patches Next.js' default externals function to make sure shared modules are bundled and not treated as external.
 *
 * @param compiler - The Webpack compiler instance.
 * @param options - The ModuleFederationPluginOptions instance.
 *
 * @remarks
 * In server builds, all node modules are treated as external, which prevents them from being shared
 * via module federation. To work around this limitation, we mark shared modules as internalizable
 * modules that webpack puts into chunks that can be streamed to other runtimes as needed.
 *
 * This function replaces Next.js' default externals function with a new asynchronous function that
 * checks whether a module should be treated as external. If the module should not be treated as
 * external, the function returns without calling the original externals function. Otherwise, the
 * function calls the original externals function and retrieves the result. If the result is null,
 * the function returns without further processing. If the module is from Next.js or React, the
 * function returns the original result. Otherwise, the function returns null.
 */
function handleServerExternals(compiler, options) {
    // Check if the compiler has an `externals` array
    if (Array.isArray(compiler.options.externals) &&
        compiler.options.externals[0]) {
        // Retrieve the original externals function
        const originalExternals = compiler.options.externals[0];
        // Replace the original externals function with a new asynchronous function
        compiler.options.externals[0] = async function (ctx, callback) {
            // Check if the module should not be treated as external
            if (ctx.request &&
                (ctx.request.includes('@module-federation/utilities') ||
                    ctx.request.includes('internal-delegate-hoist') ||
                    Object.keys(options.shared || {}).some((key) => {
                        return (
                        //@ts-ignore
                        options.shared?.[key]?.import !== false &&
                            ctx?.request?.includes(key));
                    }) ||
                    ctx.request.includes('@module-federation/dashboard-plugin'))) {
                // If the module should not be treated as external, return without calling the original externals function
                return;
            }
            // seems to cause build issues at lululemon
            // nobody else seems to run into this issue
            // #JobSecurity
            if (ctx.request && ctx.request.includes('react/jsx-runtime')) {
                return 'commonjs ' + ctx.request;
            }
            // Call the original externals function and retrieve the result
            // @ts-ignore
            const fromNext = await originalExternals(ctx, callback);
            // If the result is null, return without further processing
            if (!fromNext) {
                return;
            }
            // If the module is from Next.js or React, return the original result
            const req = fromNext.split(' ')[1];
            if (req.startsWith('next') ||
                // make sure we dont screw up package names that start with react
                // like react-carousel or react-spring
                req.startsWith('react/') ||
                req.startsWith('react-dom/') ||
                req === 'react' ||
                req === 'react-dom') {
                return fromNext;
            }
            // Otherwise, return (null) to treat the module as internalizable
            return;
        };
    }
}
exports.handleServerExternals = handleServerExternals;
/**
 * Configures server-specific compiler options.
 *
 * @param compiler - The Webpack compiler instance.
 *
 * @remarks
 * This function configures the compiler options for server builds. It turns off the compiler target on node
 * builds because it adds its own chunk loading runtime module with NodeFederationPlugin and StreamingTargetPlugin.
 * It also disables split chunks to prevent conflicts from occurring in the graph.
 *
 */
function configureServerCompilerOptions(compiler) {
    // Turn off the compiler target on node builds because we add our own chunk loading runtime module
    // with NodeFederationPlugin and StreamingTargetPlugin
    compiler.options.target = false;
    compiler.options.node = {
        ...compiler.options.node,
        global: false,
    };
    compiler.options.resolve.conditionNames = [
        'node',
        'import',
        'require',
        'default',
    ];
    // Build will hang without this. Likely something in my plugin
    compiler.options.optimization.chunkIds = 'named';
    // no custom chunk rules
    compiler.options.optimization.splitChunks = undefined;
    // solves strange issues where next doesnt create a runtime chunk
    // might be related to if an api route exists or not
    compiler.options.optimization.runtimeChunk = {
        name: 'webpack-runtime',
    };
}
exports.configureServerCompilerOptions = configureServerCompilerOptions;
//# sourceMappingURL=apply-server-plugins.js.map