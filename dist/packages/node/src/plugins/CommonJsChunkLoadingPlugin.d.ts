import type { Compiler } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
interface CommonJsChunkLoadingOptions extends ModuleFederationPluginOptions {
    baseURI: Compiler['options']['output']['publicPath'];
    promiseBaseURI?: string;
    remotes: Record<string, string>;
    name?: string;
    asyncChunkLoading: boolean;
    verbose?: boolean;
}
declare class CommonJsChunkLoadingPlugin {
    private options;
    private _asyncChunkLoading;
    constructor(options: CommonJsChunkLoadingOptions);
    apply(compiler: Compiler): void;
}
export default CommonJsChunkLoadingPlugin;
