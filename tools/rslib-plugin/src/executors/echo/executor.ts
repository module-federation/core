import type { ExecutorContext } from '@nx/devkit';

export interface EchoExecutorOptions {
  message?: string;
}

export default async function echoExecutor(
  options: EchoExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  console.info(`Executing echo for ${context.projectName}...`);
  console.info(`Message: ${options.message || 'Hello from rslib executor!'}`);

  return { success: true };
}
