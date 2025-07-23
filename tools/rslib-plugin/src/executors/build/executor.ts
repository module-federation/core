import type { ExecutorContext } from '@nx/devkit';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { glob } from 'glob';

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
  assets?: (
    | string
    | {
        glob: string;
        input: string;
        output: string;
        ignore?: string[];
      }
  )[];
  project?: string;
}

async function copyAssets(
  assets: RslibBuildExecutorOptions['assets'],
  projectPath: string,
  outputPath: string,
): Promise<void> {
  if (!assets || assets.length === 0) return;

  for (const asset of assets) {
    if (typeof asset === 'string') {
      // Simple string asset - copy as is
      const srcPath = resolve(projectPath, asset);
      const destPath = resolve(outputPath, asset);

      if (existsSync(srcPath)) {
        const destDir = resolve(destPath, '..');
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyFileSync(srcPath, destPath);
      }
    } else {
      // Complex asset object with glob
      const pattern = join(asset.input, asset.glob);
      const files = await glob(pattern, {
        cwd: projectPath,
        ignore: asset.ignore,
      });

      for (const file of files) {
        const srcPath = resolve(projectPath, file);
        const destPath = resolve(
          outputPath,
          asset.output,
          file.replace(asset.input, '').replace(/^\//, ''),
        );

        const destDir = resolve(destPath, '..');
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyFileSync(srcPath, destPath);
      }
    }
  }
}

function generateRslibConfig(
  options: RslibBuildExecutorOptions,
  projectPath: string,
  workspaceRoot: string,
) {
  const entryPoints: Record<string, string> = {};

  // Add main entry point
  if (options.main) {
    // Handle both relative (from workspace root) and absolute paths
    const mainPath = options.main.startsWith(projectPath)
      ? options.main
      : join(workspaceRoot, options.main);
    entryPoints['index'] = mainPath;
  }

  // Add additional entry points
  if (options.additionalEntryPoints) {
    for (const entryPoint of options.additionalEntryPoints) {
      // Extract just the filename without extension for the entry name
      const name =
        entryPoint
          .split('/')
          .pop()
          ?.replace(/\.(ts|tsx|js|jsx)$/, '') || 'entry';
      const entryPath = entryPoint.startsWith(projectPath)
        ? entryPoint
        : join(workspaceRoot, entryPoint);
      entryPoints[name] = entryPath;
    }
  }

  const formats = options.format || ['esm'];

  // Only generate DTS for the first format to avoid duplicates
  const libConfigs = formats.map((format, index) => ({
    format: format as any,
    bundle: true,
    autoExternal: true,
    dts: index === 0, // Only generate DTS for the first format
    output: {
      distPath: {
        root: options.outputPath
          ? options.outputPath.startsWith('/')
            ? options.outputPath
            : join(workspaceRoot, options.outputPath)
          : join(projectPath, 'dist'),
      },
    },
  }));

  // Handle tsConfig path - support both relative to project and workspace root
  let tsconfigPath: string | undefined;
  if (options.tsConfig) {
    if (options.tsConfig.startsWith(projectPath)) {
      tsconfigPath = options.tsConfig;
    } else if (options.tsConfig.startsWith('/')) {
      tsconfigPath = options.tsConfig;
    } else {
      // Relative path from workspace root (Nx convention)
      tsconfigPath = join(workspaceRoot, options.tsConfig);
    }
  }

  // Convert external array to externals object for rspack
  const externals: Record<string, string> = {};
  if (options.external) {
    for (const ext of options.external) {
      if (ext.includes('*')) {
        // Handle glob patterns like "@module-federation/*"
        const pattern = ext.replace(/\*/g, '(.*)');
        externals[pattern] = ext;
      } else {
        externals[ext] = ext;
      }
    }
  }

  return {
    lib: libConfigs,
    source: {
      entry: entryPoints,
      tsconfigPath,
    },
    tools: {
      rspack: {
        externals,
      },
    },
  };
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
    const outputPath = options.outputPath
      ? join(context.root, options.outputPath)
      : join(projectPath, 'dist');

    console.info(`Running: rslib build`);
    console.info(`Working directory: ${projectPath}`);
    console.info(`Output path: ${outputPath}`);

    // Import the rslib build function
    const { build, loadConfig } = await import('@rslib/core');

    let config;

    // Try to load existing config file first
    const configFile = options.configFile || 'rslib.config.ts';
    const configPath = resolve(projectPath, configFile);

    if (existsSync(configPath)) {
      if (options.verbose) {
        console.info(`Loading existing config from ${configPath}`);
      }
      const { content } = await loadConfig({
        cwd: projectPath,
        path: configPath,
      });
      config = content;
    } else {
      // Generate config from options if no config file exists
      if (options.verbose) {
        console.info('Generating rslib config from executor options');
      }
      config = generateRslibConfig(options, projectPath, context.root);
    }

    // Set environment
    process.env['NODE_ENV'] = options.mode || 'production';

    // Change to project directory for rslib to work correctly
    const originalCwd = process.cwd();
    process.chdir(projectPath);

    try {
      // Call rslib build API directly
      await build(config, {
        watch: options.watch || false,
        root: projectPath,
      });

      // Copy assets after build
      await copyAssets(options.assets, projectPath, outputPath);

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
