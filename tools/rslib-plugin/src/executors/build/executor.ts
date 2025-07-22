import type { ExecutorContext } from '@nx/devkit';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

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

  try {
    const projectPath = join(context.root, projectRoot);
    const configFile = options.configFile || 'rslib.config.ts';
    const configPath = resolve(projectPath, configFile);

    console.info(`Running: rslib build`);
    console.info(`Working directory: ${projectPath}`);

    // Import the rslib build function and loadConfig
    const { build, loadConfig } = await import('@rslib/core');

    // Load the configuration file using rslib's config loader
    const { content: config } = await loadConfig({
      cwd: projectPath,
      path: configPath,
    });

    // Set environment
    process.env.NODE_ENV = options.mode || 'production';

    // Change to project directory for rslib to work correctly
    const originalCwd = process.cwd();
    process.chdir(projectPath);

    try {
      // Call rslib build API directly
      await build(config, {
        watch: options.watch || false,
        root: projectPath,
      });

      console.info('✅ Rslib build completed successfully');
      return { success: true };
    } finally {
      // Restore original working directory
      process.chdir(originalCwd);
    }
  } catch (error) {
    console.error('❌ Rslib build failed:', error);
    return { success: false };
  }
}
