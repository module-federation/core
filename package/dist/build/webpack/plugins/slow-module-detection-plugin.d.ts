import type { Compiler } from 'webpack';
import type { CompilerNameValues } from '../../../shared/lib/constants';
interface ModuleBuildTimeAnalyzerOptions {
    compilerType: CompilerNameValues;
    buildTimeThresholdMs: number;
}
export default class SlowModuleDetectionPlugin {
    private options;
    constructor(options: ModuleBuildTimeAnalyzerOptions);
    apply: (compiler: Compiler) => void;
}
export {};
