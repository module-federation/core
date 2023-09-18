export = ContainerReferencePlugin;
declare class ContainerReferencePlugin {
    /**
     * @param {ContainerReferencePluginOptions} options options
     */
    constructor(options: ContainerReferencePluginOptions);
    _remoteType: import("webpack/declarations/plugins/container/ContainerReferencePlugin").ExternalsType;
    _remotes: [string, {
        external: string[];
        shareScope: string;
    }][];
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ContainerReferencePlugin {
    export { ContainerReferencePluginOptions, RemotesConfig, Compiler };
}
type Compiler = import("webpack/lib/Compiler");
type ContainerReferencePluginOptions = import("webpack/declarations/plugins/container/ContainerReferencePlugin").ContainerReferencePluginOptions;
type RemotesConfig = import("webpack/declarations/plugins/container/ContainerReferencePlugin").RemotesConfig;
