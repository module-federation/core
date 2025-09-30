import { webpack } from 'next/dist/compiled/webpack/webpack';
interface PluginOptions {
    shouldIgnorePath?: (path: string) => boolean;
    isSourceMapAsset?: (name: string) => boolean;
}
interface ValidatedOptions extends PluginOptions {
    shouldIgnorePath: Required<PluginOptions>['shouldIgnorePath'];
    isSourceMapAsset: Required<PluginOptions>['isSourceMapAsset'];
}
/**
 * This plugin adds a field to source maps that identifies which sources are
 * vendored or runtime-injected (aka third-party) sources. These are consumed by
 * Chrome DevTools to automatically ignore-list sources.
 */
export default class DevToolsIgnorePlugin {
    options: ValidatedOptions;
    constructor(options?: PluginOptions);
    apply(compiler: webpack.Compiler): void;
}
export {};
