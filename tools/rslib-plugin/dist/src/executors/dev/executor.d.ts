import type { ExecutorContext } from '@nx/devkit';
export interface RslibDevExecutorOptions {
    configFile?: string;
    port?: number;
    host?: string;
    open?: boolean;
    mode?: 'watch' | 'mf-dev';
    verbose?: boolean;
}
export default function rslibDevExecutor(options: RslibDevExecutorOptions, context: ExecutorContext): Promise<{
    success: boolean;
}>;
