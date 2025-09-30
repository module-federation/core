import { type webpack, type SourceMapDevToolPluginOptions } from 'next/dist/compiled/webpack/webpack';
export interface EvalSourceMapDevToolPluginOptions extends SourceMapDevToolPluginOptions {
    shouldIgnorePath?: (modulePath: string) => boolean;
}
export default class EvalSourceMapDevToolPlugin {
    sourceMapComment: string;
    moduleFilenameTemplate: NonNullable<EvalSourceMapDevToolPluginOptions['moduleFilenameTemplate']>;
    namespace: NonNullable<EvalSourceMapDevToolPluginOptions['namespace']>;
    options: EvalSourceMapDevToolPluginOptions;
    shouldIgnorePath: (modulePath: string) => boolean;
    /**
     * @param {SourceMapDevToolPluginOptions|string} inputOptions Options object
     */
    constructor(inputOptions: EvalSourceMapDevToolPluginOptions);
    /**
     * Apply the plugin
     * @param compiler the compiler instance
     */
    apply(compiler: webpack.Compiler): void;
}
