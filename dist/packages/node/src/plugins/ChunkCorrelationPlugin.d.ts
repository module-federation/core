export = FederationStatsPlugin;
/**
 * @typedef {object} FederationStatsPluginOptions
 * @property {string} filename The filename in the `output.path` directory to write stats to.
 */
/**
 * Writes relevant federation stats to a file for further consumption.
 */
declare class FederationStatsPlugin {
    /**
     *
     * @param {FederationStatsPluginOptions} options
     */
    constructor(options: FederationStatsPluginOptions);
    _options: FederationStatsPluginOptions;
    /**
     *
     * @param {import("webpack").Compiler} compiler
     */
    apply(compiler: import("webpack").Compiler): void;
}
declare namespace FederationStatsPlugin {
    export { WebpackStats, WebpackStatsChunk, WebpackStatsModule, SharedDependency, SharedModule, Exposed, FederatedContainer, FederatedStats, FederationStatsPluginOptions };
}
type FederationStatsPluginOptions = {
    /**
     * The filename in the `output.path` directory to write stats to.
     */
    filename: string;
};
type WebpackStats = any;
type WebpackStatsChunk = any;
type WebpackStatsModule = any;
type SharedDependency = {
    shareScope: string;
    shareKey: string;
    requiredVersion: string;
    strictVersion: boolean;
    singleton: boolean;
    eager: boolean;
};
type SharedModule = {
    chunks: string[];
    provides: SharedDependency[];
};
type Exposed = {
    chunks: string[];
    sharedModules: SharedModule[];
};
type FederatedContainer = {
    remote: string;
    entry: string;
    sharedModules: SharedModule[];
    exposes: {
        [key: string]: Exposed;
    };
};
type FederatedStats = {
    sharedModules: SharedModule[];
    federatedModules: FederatedContainer[];
};
