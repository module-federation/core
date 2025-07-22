import type { ExecutorContext } from '@nx/devkit';
export interface RslibBuildExecutorOptions {
    configFile?: string;
    outputPath?: string;
    watch?: boolean;
    mode?: 'development' | 'production';
    verbose?: boolean;
}
export default function rslibBuildExecutor(options: RslibBuildExecutorOptions, context: ExecutorContext): Promise<{
    success: boolean;
}>;
