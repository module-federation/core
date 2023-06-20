import { Compiler } from 'webpack';
import { NormalizeOptions } from '../lib/normalizeOptions';
export declare class FederatedTypesStatsPlugin {
    private options;
    constructor(options: NormalizeOptions);
    apply(compiler: Compiler): void;
}
