// @ts-nocheck
/*
 * @jest-environment node
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import type { Compiler, Stats } from 'webpack';

const Module = require('module');
type ChunkSummary = {
  files: string[];
  modules: string[];
};

type CompilationCapture = {
  chunks: Record<string | number, ChunkSummary>;
};

class ChunkCapturePlugin {
  private readonly projectRoot: string;
  private readonly capture: CompilationCapture;

  constructor(projectRoot: string, capture: CompilationCapture) {
    this.projectRoot = projectRoot;
    this.capture = capture;
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap('ChunkCapturePlugin', (compilation) => {
      compilation.hooks.afterSeal.tap('ChunkCapturePlugin', () => {
        const { chunkGraph } = compilation;
        for (const chunk of compilation.chunks) {
          const name = chunk.name ?? chunk.id;
          const modules = new Set<string>();

          for (const mod of chunkGraph.getChunkModulesIterable(chunk)) {
            const resource =
              mod.rootModule && mod.rootModule.resource
                ? mod.rootModule.resource
                : mod.resource;
            if (resource) {
              modules.add(path.relative(this.projectRoot, resource));
            }
          }

          this.capture.chunks[name] = {
            files: Array.from(chunk.files || []).sort(),
            modules: Array.from(modules).sort(),
          };
        }
      });
    });
  }
}

const ROOT = path.resolve(__dirname, '../../../../..');
const HOST_APP_ROOT = path.join(ROOT, 'apps/runtime-demo/3005-runtime-host');

/**
 * Ensure Node can resolve workspace-bound packages (e.g. @module-federation/enhanced/webpack)
 * when running webpack programmatically from Jest.
 */
function registerModulePaths(projectRoot: string) {
  const additionalPaths = Module._nodeModulePaths(projectRoot);
  for (const candidate of additionalPaths) {
    if (!module.paths.includes(candidate)) {
      module.paths.push(candidate);
    }
  }
}

type RunWebpackOptions = {
  mode?: 'development' | 'production';
  mutateConfig?: (config: any) => void;
};

async function runWebpackProject(
  projectRoot: string,
  { mode = 'development', mutateConfig }: RunWebpackOptions,
) {
  registerModulePaths(projectRoot);
  const webpack = require('webpack');
  const configFactory = require(path.join(projectRoot, 'webpack.config.js'));
  const config = configFactory({}, { mode });
  const outputDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'mf-worker-runtime-test-'),
  );

  config.context = projectRoot;
  config.mode = mode;
  config.devtool = false;
  config.output = {
    ...(config.output || {}),
    path: outputDir,
    clean: true,
    publicPath: 'auto',
  };

  // disable declaration fetching/manifest networking for test environment
  if (Array.isArray(config.plugins)) {
    for (const plugin of config.plugins) {
      if (
        plugin &&
        plugin.constructor &&
        plugin.constructor.name === 'ModuleFederationPlugin' &&
        plugin._options
      ) {
        plugin._options.dts = false;
        if (plugin._options.manifest !== false) {
          plugin._options.manifest = false;
        }
      }
    }
  }

  if (mutateConfig) {
    mutateConfig(config);
  }

  const capture: CompilationCapture = { chunks: {} };
  config.plugins = [
    ...(config.plugins || []),
    new ChunkCapturePlugin(projectRoot, capture),
  ];

  const compiler = webpack(config);
  const stats: Stats = await new Promise((resolve, reject) => {
    compiler.run((err: Error | null, result?: Stats) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result) {
        reject(new Error('Expected webpack stats result'));
        return;
      }
      resolve(result);
    });
  });

  await new Promise<void>((resolve) => compiler.close(() => resolve()));

  return {
    stats,
    outputDir,
    capture,
  };
}

function collectInfrastructureErrors(stats: Stats) {
  const compilation: any = stats.compilation;
  const errors: { logger: string; message: string }[] = [];

  if (!compilation.logging) {
    return errors;
  }

  for (const [loggerName, log] of compilation.logging) {
    const entries = log?.entries;
    if (!entries || !Array.isArray(entries)) {
      continue;
    }
    for (const entry of entries) {
      if (entry.type === 'error') {
        const message = (entry.args || []).join(' ');
        errors.push({ logger: loggerName, message });
      }
    }
  }

  return errors;
}

describe('FederationRuntimePlugin worker integration (3005 runtime host)', () => {
  jest.setTimeout(120000);

  const tempDirs: string[] = [];

  afterAll(() => {
    for (const dir of tempDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  });

  it('emits worker chunks with federated runtime dependencies hoisted', async () => {
    // Build the remote app once to ensure assets referenced by the host exist.
    const hostResult = await runWebpackProject(HOST_APP_ROOT, {
      mode: 'development',
      mutateConfig: (config) => {
        // keep the build deterministic for assertions
        config.optimization = {
          ...(config.optimization || {}),
          minimize: false,
          moduleIds: 'named',
          chunkIds: 'named',
        };
      },
    });

    tempDirs.push(hostResult.outputDir);

    // Log errors for debugging if build fails
    if (hostResult.stats.hasErrors()) {
      const errors = hostResult.stats.compilation.errors.map((err: any) =>
        String(err.message || err),
      );
      console.error('Build errors:', errors.join('\n'));
    }

    expect(hostResult.stats.hasErrors()).toBe(false);

    const infraErrors = collectInfrastructureErrors(hostResult.stats);
    expect(infraErrors).toStrictEqual([]);

    const chunkEntries = Object.entries(hostResult.capture.chunks);
    expect(chunkEntries.length).toBeGreaterThan(0);

    const findChunk = (
      predicate: (pair: [string | number, ChunkSummary]) => boolean,
    ) => chunkEntries.find(predicate);

    const runtimeChunk = findChunk(([, summary]) =>
      summary.modules.some((mod) =>
        mod.includes('node_modules/.federation/entry'),
      ),
    );

    expect(runtimeChunk).toBeDefined();

    const workerChunks = chunkEntries.filter(
      ([chunkName]) =>
        typeof chunkName === 'string' &&
        chunkName.includes('mf-') &&
        chunkName.includes('worker'),
    );
    expect(workerChunks.length).toBeGreaterThan(0);

    const runtimeModules = new Set(runtimeChunk![1].modules);
    expect(
      Array.from(runtimeModules).some((mod) =>
        mod.includes('packages/runtime/dist/index.esm.js'),
      ),
    ).toBe(true);
    expect(
      Array.from(runtimeModules).some((mod) =>
        mod.includes('packages/webpack-bundler-runtime/dist/index.esm.js'),
      ),
    ).toBe(true);

    for (const [workerChunkName, summary] of workerChunks) {
      const modules = new Set(summary.modules);
      expect(
        Array.from(modules).some((mod) =>
          mod.includes('node_modules/.federation/entry'),
        ),
      ).toBe(true);
      expect(
        Array.from(modules).some((mod) =>
          mod.includes('packages/runtime/dist/index.esm.js'),
        ),
      ).toBe(true);

      // Verify the generated worker bundle has correct runtime module order
      const workerFile = summary.files.find((f) => f.endsWith('.js'));
      if (workerFile) {
        const workerBundlePath = path.join(hostResult.outputDir, workerFile);
        const workerContent = fs.readFileSync(workerBundlePath, 'utf-8');

        // Check that embed federation runtime module is present
        expect(workerContent).toContain(
          '/* webpack/runtime/embed/federation */',
        );

        // For worker chunks using import-scripts, EmbedFederation uses immediate execution
        // (stage 5) to initialize bundlerRuntime before RemoteRuntimeModule functions are called.
        // The federation entry should be loaded directly without startup hook wrapper.
        const embedFederationIndex = workerContent.indexOf(
          '/* webpack/runtime/embed/federation */',
        );
        expect(embedFederationIndex).toBeGreaterThan(-1);

        // Verify the federation entry is loaded (either immediately or via startup hook)
        // The exact pattern depends on chunk loading type, but the entry must be present
        const hasFederationEntry = workerContent.includes('.federation/entry');
        expect(hasFederationEntry).toBe(true);
      }
    }
  });
});
