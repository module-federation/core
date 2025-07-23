import type { ExecutorContext } from '@nx/devkit';
export interface RslibBuildExecutorOptions {
    configFile?: string;
    outputPath?: string;
    watch?: boolean;
    mode?: 'development' | 'production';
    verbose?: boolean;
    main?: string;
    additionalEntryPoints?: string[];
    external?: string[];
    format?: ('cjs' | 'esm' | 'umd' | 'iife')[];
    tsConfig?: string;
    assets?: (string | {
        glob: string;
        input: string;
        output: string;
        ignore?: string[];
    })[];
    project?: string;
}
export default function rslibBuildExecutor(options: RslibBuildExecutorOptions, context: ExecutorContext): Promise<{
    success: boolean;
}>;
