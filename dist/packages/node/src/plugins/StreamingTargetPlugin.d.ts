import type { Compiler } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
interface StreamingTargetOptions extends ModuleFederationPluginOptions {
    promiseBaseURI?: string;
    verbose?: boolean;
}
declare class StreamingTargetPlugin {
    private options;
    constructor(options: StreamingTargetOptions);
    apply(compiler: Compiler): void;
}
export default StreamingTargetPlugin;
