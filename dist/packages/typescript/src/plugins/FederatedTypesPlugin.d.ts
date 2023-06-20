import { Compiler } from 'webpack';
import { FederatedTypesPluginOptions } from '../types';
export declare class FederatedTypesPlugin {
    private options;
    private normalizeOptions;
    private logger;
    constructor(options: FederatedTypesPluginOptions);
    apply(compiler: Compiler): void;
    private compileTypes;
    private importRemoteTypes;
    private getError;
}
