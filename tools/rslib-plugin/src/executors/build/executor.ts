import type { ExecutorContext } from '@nx/devkit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

export interface RslibBuildExecutorOptions {
  configFile?: string;
  outputPath?: string;
  watch?: boolean;
  mode?: 'development' | 'production';
  verbose?: boolean;
}

export default async function rslibBuildExecutor(
  options: RslibBuildExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const projectRoot =
    context.projectGraph?.nodes[context.projectName!]?.data?.root;

  if (!projectRoot) {
    throw new Error(`Could not find project root for ${context.projectName}`);
  }

  console.info(`Executing rslib build for ${context.projectName}...`);

  if (options.verbose) {
    console.info(`Options: ${JSON.stringify(options, null, 2)}`);
    console.info(`Project root: ${projectRoot}`);
    console.info(`Workspace root: ${context.root}`);
  }

  // Construct the rslib command
  const args = ['rslib', 'build'];

  if (options.configFile && options.configFile !== 'rslib.config.ts') {
    args.push('--config', options.configFile);
  }

  if (options.watch) {
    args.push('--watch');
  }

  // Note: --mode option not supported in current rslib version
  // Environment will be set via NODE_ENV instead

  const command = args.join(' ');

  try {
    console.info(`Running: ${command}`);
    console.info(`Working directory: ${join(context.root, projectRoot)}`);

    const { stdout, stderr } = await promisify(exec)(command, {
      cwd: join(context.root, projectRoot),
      env: {
        ...process.env,
        NODE_ENV: options.mode || 'production',
      },
    });

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.error(stderr);
    }

    console.info('✅ Rslib build completed successfully');
    return { success: !stderr };
  } catch (error) {
    console.error('❌ Rslib build failed:', error);
    return { success: false };
  }
}
