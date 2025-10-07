import type { ExecutorContext } from '@nx/devkit';
export interface EchoExecutorOptions {
    message?: string;
}
export default function echoExecutor(options: EchoExecutorOptions, context: ExecutorContext): Promise<{
    success: boolean;
}>;
