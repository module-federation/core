export = ContainerPlugin;
declare class ContainerPlugin {
    /**
     * @param {ContainerPluginOptions} options options
     */
    constructor(options: any);
    _options: {
        name: any;
        shareScope: any;
        library: any;
        runtime: any;
        filename: any;
        exposes: [string, {
            import: any;
            name: any;
        }][];
    };
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: any): void;
}
declare namespace ContainerPlugin {
    export { ContainerPluginOptions, Compiler };
}
type ContainerPluginOptions = any;
type Compiler = any;
