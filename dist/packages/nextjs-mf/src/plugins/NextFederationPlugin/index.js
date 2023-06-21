/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Zackary Jackson @ScriptedAlchemy
*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextFederationPlugin = void 0;
const tslib_1 = require("tslib");
const utilities_1 = require("@module-federation/utilities");
const CopyFederationPlugin_1 = tslib_1.__importDefault(require("../CopyFederationPlugin"));
const next_fragments_1 = require("./next-fragments");
const internal_1 = require("../../internal");
const AddRuntimeRequirementToPromiseExternalPlugin_1 = tslib_1.__importDefault(require("../AddRuntimeRequirementToPromiseExternalPlugin"));
const nextPageMapLoader_1 = require("../../loaders/nextPageMapLoader");
const remove_unnecessary_shared_keys_1 = require("./remove-unnecessary-shared-keys");
const set_options_1 = require("./set-options");
const validate_options_1 = require("./validate-options");
const apply_server_plugins_1 = require("./apply-server-plugins");
const apply_client_plugins_1 = require("./apply-client-plugins");
/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application
 * federation using Module Federation.
 */
class NextFederationPlugin {
    /**
     * Constructs the NextFederationPlugin with the provided options.
     *
     * @param options The options to configure the plugin.
     */
    constructor(options) {
        const { mainOptions, extraOptions } = (0, set_options_1.setOptions)(options);
        this._options = mainOptions;
        this._extraOptions = extraOptions;
    }
    apply(compiler) {
        // Validate the compiler options
        const validCompile = (0, validate_options_1.validateCompilerOptions)(compiler);
        if (!validCompile)
            return;
        // Validate the NextFederationPlugin options
        (0, validate_options_1.validatePluginOptions)(this._options);
        // Check if the compiler is for the server or client
        const isServer = compiler.options.name === 'server';
        const { webpack } = compiler;
        // Apply the CopyFederationPlugin
        new CopyFederationPlugin_1.default(isServer).apply(compiler);
        // If remotes are provided, parse them
        if (this._options.remotes) {
            // @ts-ignore
            this._options.remotes = (0, internal_1.parseRemotes)(this._options.remotes);
        }
        // If shared modules are provided, remove unnecessary shared keys from the default share scope
        if (this._options.shared) {
            (0, remove_unnecessary_shared_keys_1.removeUnnecessarySharedKeys)(this._options.shared);
        }
        const ModuleFederationPlugin = (0, next_fragments_1.getModuleFederationPluginConstructor)(isServer, compiler);
        const defaultShared = (0, next_fragments_1.retrieveDefaultShared)(isServer);
        if (isServer) {
            // Refactored server condition
            (0, apply_server_plugins_1.configureServerCompilerOptions)(compiler);
            (0, apply_server_plugins_1.configureServerLibraryAndFilename)(this._options);
            (0, apply_server_plugins_1.applyServerPlugins)(compiler, this._options);
            (0, apply_server_plugins_1.handleServerExternals)(compiler, {
                ...this._options,
                shared: { ...defaultShared, ...this._options.shared },
            });
        }
        else {
            (0, apply_client_plugins_1.applyClientPlugins)(compiler, this._options, this._extraOptions);
        }
        (0, next_fragments_1.applyPathFixes)(compiler, this._extraOptions);
        // @ts-ignore
        const hostFederationPluginOptions = {
            ...this._options,
            runtime: false,
            exposes: {
                //something must be exposed in order to generate a remote entry, which is needed to kickstart runtime
                './noop': require.resolve('../../federation-noop.js'),
                ...(this._extraOptions.exposePages
                    ? (0, nextPageMapLoader_1.exposeNextjsPages)(compiler.options.context)
                    : {}),
                ...this._options.exposes,
            },
            remotes: {
                //@ts-ignore
                ...this._options.remotes,
            },
            shared: {
                ...defaultShared,
                ...this._options.shared,
            },
        };
        if (this._extraOptions.debug) {
            compiler.options.devtool = false;
        }
        compiler.options.output.uniqueName = this._options.name;
        // inject module hoisting system
        (0, next_fragments_1.applyRemoteDelegates)(this._options, compiler);
        //@ts-ignore
        if (this._extraOptions.automaticAsyncBoundary) {
            console.warn('[nextjs-mf]: automaticAsyncBoundary is deprecated');
        }
        //todo runtime variable creation needs to be applied for server as well. this is just for client
        // TODO: this needs to be refactored into something more comprehensive. this is just a quick fix
        new webpack.DefinePlugin({
            'process.env.REMOTES': (0, utilities_1.createRuntimeVariables)(this._options.remotes),
            'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
        }).apply(compiler);
        // @ts-ignore
        new ModuleFederationPlugin(hostFederationPluginOptions).apply(compiler);
        if (Object.keys(this._options?.remotes || {}).length > 0 ||
            Object.keys(this._options?.exposes || {}).length > 0) {
            const commonOptions = {
                ...hostFederationPluginOptions,
                name: 'host_inner_ctn',
                runtime: isServer ? 'webpack-runtime' : 'webpack',
                filename: `host_inner_ctn.js`,
                library: {
                    ...hostFederationPluginOptions.library,
                    name: this._options.name,
                },
                shared: {
                    ...hostFederationPluginOptions.shared,
                    ...defaultShared,
                },
            };
            // @ts-ignore
            new ModuleFederationPlugin({
                ...commonOptions,
            }).apply(compiler);
        }
        new AddRuntimeRequirementToPromiseExternalPlugin_1.default().apply(compiler);
    }
}
exports.NextFederationPlugin = NextFederationPlugin;
exports.default = NextFederationPlugin;
//# sourceMappingURL=index.js.map