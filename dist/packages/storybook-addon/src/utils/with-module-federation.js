"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@nx/react/src/module-federation/utils");
const webpack_1 = require("webpack");
const { ModuleFederationPlugin } = webpack_1.container;
const updateMappedRemotes = (remotes) => {
    const newRemotes = {};
    Object.keys(remotes).forEach((key) => {
        newRemotes[key] = `${key}@${remotes[key]}`;
    });
    return newRemotes;
};
const withModuleFederation = async (options) => {
    const { mappedRemotes, sharedDependencies } = await (0, utils_1.getModuleFederationConfig)(options);
    return (config) => {
        config.experiments = { outputModule: false };
        config.optimization = {
            runtimeChunk: false,
        };
        config.output = {
            publicPath: 'auto',
        };
        config.plugins = config.plugins || [];
        config.plugins.push(new ModuleFederationPlugin({
            name: options.name,
            filename: 'remoteEntry.js',
            shared: sharedDependencies,
            exposes: options.exposes,
            remotes: updateMappedRemotes(mappedRemotes),
        }));
        return config;
    };
};
exports.default = withModuleFederation;
//# sourceMappingURL=with-module-federation.js.map