export = ContainerReferencePlugin;
declare class ContainerReferencePlugin {
    /**
     * @param {ContainerReferencePluginOptions} options options
     */
    constructor(options: any);
    _remoteType: any;
    _remotes: [string, {
        external: any;
        shareScope: any;
    }][];
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: any): void;
}
declare namespace ContainerReferencePlugin {
    export { ContainerReferencePluginOptions, RemotesConfig, Compiler };
}
type ContainerReferencePluginOptions = any;
type RemotesConfig = any;
type Compiler = any;
