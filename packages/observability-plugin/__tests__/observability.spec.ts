import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createObservability, ObservabilityPlugin } from '../src';
import {
  ObservabilityBuildPlugin,
  createObservabilityBuildInfo,
} from '../src/build';
import { ChromeObservabilityPlugin } from '../src/chrome-devtool';
import { createNodeObservability as ObservabilityNode } from '../src/node';

const enabledOrigin = {
  version: '2.5.0',
  options: {
    name: 'host',
  },
};

const createShared = (overrides: Record<string, unknown> = {}) => ({
  version: '18.3.1',
  scope: ['default'],
  from: 'host',
  deps: [],
  useIn: [],
  strategy: 'loaded-first',
  shareConfig: {
    requiredVersion: '^18.0.0',
    singleton: false,
    strictVersion: false,
    eager: false,
  },
  get: () => () => ({ value: 'shared' }),
  ...overrides,
});

const hasUndefinedField = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(hasUndefinedField);
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value as Record<string, unknown>).some(
    (item) => item === undefined || hasUndefinedField(item),
  );
};

describe('ObservabilityBuildPlugin', () => {
  it('creates a build info summary from manifest and config data', () => {
    const buildInfo = createObservabilityBuildInfo({
      generatedAt: '2026-01-01T00:00:00.000Z',
      bundler: 'webpack',
      bundlerVersion: '5.99.0',
      compilerOptions: {
        mode: 'production',
        target: ['web'],
        output: {
          publicPath: 'https://cdn.example.com/assets/?v=20260101#hash',
        },
      },
      moduleFederation: {
        name: 'runtime_host',
        filename: 'remoteEntry.js',
        experiments: {
          asyncStartup: true,
        },
        shareStrategy: 'loaded-first',
        remotes: {
          remote1:
            'runtime_remote1@http://localhost:3006/mf-manifest.json?token=secret#hash',
        },
        exposes: {
          './Button': '/Users/bytedance/project/src/Button.tsx',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^18.2.0',
            eager: true,
          },
        },
        manifest: {
          fileName: 'mf-manifest',
        },
      },
      manifest: {
        name: 'runtime_host',
        metaData: {
          pluginVersion: '2.4.0',
          globalName: 'runtime_host_global',
          publicPath: 'https://cdn.example.com/assets/?v=20260101#hash',
          buildInfo: {
            buildVersion: '202601010000',
            buildName: 'runtime-host',
          },
          remoteEntry: {
            name: 'remoteEntry.js',
            type: 'global',
          },
        },
        remotes: [
          {
            moduleName: 'remote1',
            entry: 'http://localhost:3006/mf-manifest.json?token=secret#hash',
          },
        ],
        exposes: [
          {
            name: './Button',
            path: '/Users/bytedance/project/src/Button.tsx',
          },
        ],
        shared: [
          {
            name: 'react',
            version: '18.3.1',
            singleton: true,
            requiredVersion: '^18.2.0',
          },
        ],
      },
    });

    expect(buildInfo).toMatchObject({
      schemaVersion: 1,
      source: 'manifest',
      bundler: {
        name: 'webpack',
        version: '5.99.0',
        mode: 'production',
        target: ['web'],
      },
      moduleFederation: {
        name: 'runtime_host',
        pluginVersion: '2.4.0',
        buildVersion: '202601010000',
        buildName: 'runtime-host',
        remoteEntry: {
          name: 'remoteEntry.js',
          type: 'global',
          globalName: 'runtime_host_global',
          publicPath: 'https://cdn.example.com/assets/?v=20260101#hash',
          publicPathMode: 'static',
        },
        options: {
          shareStrategy: 'loaded-first',
          asyncStartup: true,
          manifest: 'mf-manifest',
        },
        remotes: [
          {
            name: 'remote1',
            entry: 'http://localhost:3006/mf-manifest.json?token=secret#hash',
          },
        ],
        exposes: [
          {
            name: './Button',
          },
        ],
        shared: [
          {
            name: 'react',
            version: '18.3.1',
            singleton: true,
            requiredVersion: '^18.2.0',
          },
        ],
      },
      summary: {
        remoteCount: 1,
        exposeCount: 1,
        sharedCount: 1,
      },
    });
    expect(JSON.stringify(buildInfo)).toContain('token=secret#hash');
    expect(JSON.stringify(buildInfo)).not.toContain('/Users/bytedance');
  });

  it('writes build observability without requiring runtime loading', async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-build-observability-'),
    );
    try {
      const { processAssetsCallbacks, warn } = createBuildCompilerFixture(
        directory,
        {
          manifest: {
            name: 'runtime_host',
            metaData: {
              pluginVersion: '2.4.0',
              globalName: 'runtime_host_global',
              publicPath: 'auto',
              buildInfo: {
                buildVersion: '202601010000',
              },
              remoteEntry: {
                name: 'remoteEntry.js',
                type: 'global',
              },
            },
            remotes: [],
            exposes: [{ name: './Button' }],
            shared: [{ name: 'react', requiredVersion: '^18.2.0' }],
          },
        },
      );

      await processAssetsCallbacks[0]();

      const outputFile = path.join(
        directory,
        '.mf/observability/build-info.json',
      );
      await waitForFile(outputFile);
      const buildInfo = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

      expect(buildInfo).toMatchObject({
        source: 'manifest',
        bundler: {
          name: 'webpack',
          version: '5.99.0',
          mode: 'development',
          target: ['web'],
        },
        moduleFederation: {
          name: 'runtime_host',
          pluginVersion: '2.4.0',
          buildVersion: '202601010000',
          remoteEntry: {
            name: 'remoteEntry.js',
            publicPath: 'auto',
            publicPathMode: 'auto',
          },
        },
        summary: {
          exposeCount: 1,
          sharedCount: 1,
        },
      });
      expect(warn).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('does not fail the build when observability file output fails', async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-build-observability-'),
    );
    try {
      const blocker = path.join(directory, 'blocker');
      fs.writeFileSync(blocker, 'not a directory', 'utf8');
      const { processAssetsCallbacks, warn } = createBuildCompilerFixture(
        directory,
        {
          outputFile: path.join(blocker, 'build-info.json'),
        },
      );

      await expect(processAssetsCallbacks[0]()).resolves.toBeUndefined();

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write build observability'),
      );
      const report = JSON.parse(
        fs.readFileSync(
          path.join(directory, '.mf/observability/build-report.json'),
          'utf8',
        ),
      );
      expect(report).toMatchObject({
        source: 'build',
        status: 'error',
        failedPhase: 'observability-output',
        summary: {
          outcome: 'failed',
          error: {
            failedPhase: 'observability-output',
            ownerHint: 'build',
            retryable: false,
          },
        },
        diagnosis: {
          status: 'error',
          outcome: 'failed',
          ownerHint: 'build',
          failedPhase: 'observability-output',
          actions: [
            expect.objectContaining({
              id: 'check-observability-output',
              ownerHint: 'build',
            }),
          ],
          facts: expect.objectContaining({
            failedPhase: 'observability-output',
            ownerHint: 'build',
            mfName: 'runtime_host',
          }),
        },
      });
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('writes a build report for compilation errors', async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-build-observability-'),
    );
    try {
      const error = new Error(
        '[ Federation Build ] remoteEntry failed #BUILD-001 token=demo-secret http://localhost:3001/remoteEntry.js?token=demo-secret#hash',
      );
      error.stack = [
        'Error: token=demo-secret remoteEntry failed',
        '    at build (/Users/bytedance/private/webpack.config.js:1:1)',
        '    at remote (http://localhost:3001/remoteEntry.js?token=demo-secret#hash:1:1)',
      ].join('\n');

      const { processAssetsCallbacks, warn } = createBuildCompilerFixture(
        directory,
        {
          errors: [error],
        },
      );

      await processAssetsCallbacks[0]();

      const report = JSON.parse(
        fs.readFileSync(
          path.join(directory, '.mf/observability/build-report.json'),
          'utf8',
        ),
      );
      expect(report).toMatchObject({
        schemaVersion: 1,
        source: 'build',
        status: 'error',
        failedPhase: 'compilation',
        build: {
          moduleFederation: {
            name: 'runtime_host',
          },
        },
        summary: {
          outcome: 'failed',
          error: {
            errorCode: 'BUILD-001',
            failedPhase: 'compilation',
            ownerHint: 'remote',
            retryable: false,
          },
        },
        diagnosis: {
          title: 'Module Federation build failed',
          status: 'error',
          outcome: 'failed',
          ownerHint: 'remote',
          failedPhase: 'compilation',
          errorCode: 'BUILD-001',
          facts: expect.objectContaining({
            failedPhase: 'compilation',
            remoteCount: 1,
            exposeCount: 1,
            sharedCount: 1,
            remotes: 'remote1',
            exposes: './Button',
            shared: 'react',
          }),
          actions: [
            expect.objectContaining({
              id: 'inspect-build-errors',
              ownerHint: 'remote',
            }),
            expect.objectContaining({
              id: 'check-remote-config',
              ownerHint: 'remote',
            }),
          ],
        },
      });
      expect(JSON.stringify(report)).toContain('demo-secret');
      expect(JSON.stringify(report)).toContain('token=');
      expect(JSON.stringify(report)).toContain('#hash');
      expect(JSON.stringify(report)).toContain('/Users/bytedance');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('removes stale build reports after a clean build', async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-build-observability-'),
    );
    try {
      const reportFile = path.join(
        directory,
        '.mf/observability/build-report.json',
      );
      fs.mkdirSync(path.dirname(reportFile), { recursive: true });
      fs.writeFileSync(reportFile, '{"status":"error"}', 'utf8');

      const { processAssetsCallbacks } = createBuildCompilerFixture(directory);

      await processAssetsCallbacks[0]();

      expect(fs.existsSync(reportFile)).toBe(false);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});

const emitRemoteLoaded = (
  observability: ReturnType<typeof createObservability>,
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin.onLoad?.({
    id: 'remote/Button',
    pkgNameOrAlias: 'remote',
    expose: './Button',
    remote: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
    options: {},
    origin: enabledOrigin,
    exposeModule: {},
    exposeModuleFactory: undefined,
    moduleInstance: {},
    ...overrides,
  } as any);

const emitRemoteStart = (
  observability: ReturnType<typeof createObservability>,
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin.beforeRequest?.({
    id: 'remote/Button',
    options: {},
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitRemoteComplete = (
  observability: ReturnType<typeof createObservability>,
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin.afterLoadRemote?.({
    id: 'remote/Button',
    expose: './Button',
    remote: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitRemoteMatch = (
  observability: ReturnType<typeof createObservability>,
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin.afterMatchRemote?.({
    id: 'remote/Button',
    expose: './Button',
    remoteInfo: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitRemoteInit = (
  observability: ReturnType<typeof createObservability>,
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin.afterInitRemote?.({
    id: 'remote/Button',
    remoteInfo: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitExposePhase = (
  observability: ReturnType<typeof createObservability>,
  hookName: 'beforeGetExpose' | 'afterGetExpose',
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin[hookName]?.({
    id: 'remote/Button',
    expose: './Button',
    moduleInfo: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitFactoryPhase = (
  observability: ReturnType<typeof createObservability>,
  hookName: 'beforeExecuteFactory' | 'afterExecuteFactory',
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin[hookName]?.({
    id: 'remote/Button',
    expose: './Button',
    moduleInfo: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
    loadFactory: true,
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitRemoteError = (
  observability: ReturnType<typeof createObservability>,
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin.errorLoadRemote?.({
    id: 'remote/Button',
    error: new Error('remote load failed'),
    from: 'runtime',
    lifecycle: 'onLoad',
    expose: './Button',
    remote: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitManifestError = (
  observability: ReturnType<typeof createObservability>,
  overrides: Record<string, unknown> = {},
) =>
  observability.plugin.errorLoadRemote?.({
    id: 'http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
    error: new Error('token=demo-secret manifest failed'),
    from: 'runtime',
    lifecycle: 'afterResolve',
    remote: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
    },
    origin: enabledOrigin,
    ...overrides,
  } as any);

const createLoadedBeforeFederationFixture = () => {
  const currentOrigin = {
    version: '2.5.0',
    options: {
      name: 'consumer_b',
    },
    moduleCache: new Map([
      [
        'provider',
        {
          remoteInfo: {
            name: 'provider',
            entryGlobalName: 'provider_global',
          },
          remoteEntryExports: { get: vi.fn() },
          inited: true,
        },
      ],
    ]),
  };
  const previousConsumer = {
    version: '2.5.0',
    options: {
      name: 'consumer_a',
    },
    moduleCache: new Map([
      [
        'provider',
        {
          remoteInfo: {
            name: 'provider',
            entryGlobalName: 'provider_global',
          },
          remoteEntryExports: { get: vi.fn() },
          inited: true,
        },
      ],
    ]),
    remoteHandler: {
      idToRemoteMap: {
        'provider/Button': {
          name: 'provider',
          expose: './Button',
        },
        'provider/Card': {
          name: 'provider',
          expose: './Card',
        },
      },
    },
  };

  return {
    currentOrigin,
    previousConsumer,
    federation: {
      __INSTANCES__: [currentOrigin, previousConsumer],
    },
  };
};

const waitForFile = async (filePath: string) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 1000) {
    if (fs.existsSync(filePath)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error(`Timed out waiting for ${filePath}`);
};

const createBuildCompilerFixture = (
  tempDir: string,
  options: {
    manifest?: Record<string, unknown>;
    stats?: Record<string, unknown>;
    moduleFederation?: Record<string, unknown>;
    outputFile?: string;
    errorReport?:
      | false
      | {
          outputFile?: string;
        };
    errors?: unknown[];
  } = {},
) => {
  const processAssetsCallbacks: Array<() => Promise<void>> = [];
  const emittedAssets: Record<string, { source(): string }> = {};
  const warn = vi.fn();
  const compilation = {
    constructor: {
      PROCESS_ASSETS_STAGE_REPORT: 5000,
    },
    getAsset: (assetName: string) => {
      if (assetName === 'mf-manifest.json' && options.manifest) {
        return {
          source: {
            source: () => JSON.stringify(options.manifest),
          },
        };
      }
      if (assetName === 'mf-stats.json' && options.stats) {
        return {
          source: {
            source: () => JSON.stringify(options.stats),
          },
        };
      }
      return undefined;
    },
    emitAsset: (name: string, source: { source(): string }) => {
      emittedAssets[name] = source;
    },
    errors: options.errors || [],
    hooks: {
      processAssets: {
        tapPromise: (
          _options: { name: string; stage?: number },
          callback: () => Promise<void>,
        ) => {
          processAssetsCallbacks.push(callback);
        },
      },
    },
  };
  const moduleFederation = options.moduleFederation || {
    name: 'runtime_host',
    remotes: {
      remote1:
        'runtime_remote1@http://localhost:3006/mf-manifest.json?token=secret#hash',
    },
    exposes: {
      './Button': '/Users/bytedance/project/src/Button.tsx',
    },
    shared: {
      react: {
        singleton: true,
        requiredVersion: '^18.2.0',
      },
    },
  };
  const compiler = {
    context: tempDir,
    options: {
      context: tempDir,
      mode: 'development',
      target: 'web',
      output: {
        publicPath: 'auto',
      },
      plugins: [
        {
          name: 'ModuleFederationPlugin',
          _options: moduleFederation,
        },
      ],
    },
    webpack: {
      version: '5.99.0',
      sources: {
        RawSource: class RawSource {
          private readonly value: string;

          constructor(value: string) {
            this.value = value;
          }

          source() {
            return this.value;
          }
        },
      },
      Compilation: {
        PROCESS_ASSETS_STAGE_REPORT: 5000,
      },
    },
    hooks: {
      thisCompilation: {
        tap: (
          _name: string,
          callback: (receivedCompilation: typeof compilation) => void,
        ) => {
          callback(compilation);
        },
      },
    },
    getInfrastructureLogger: () => ({
      warn,
    }),
  };

  new ObservabilityBuildPlugin({
    outputFile: options.outputFile,
    errorReport: options.errorReport,
  }).apply(compiler);

  return {
    processAssetsCallbacks,
    warn,
  };
};

describe('ObservabilityPlugin', () => {
  it('returns a runtime plugin and attaches markComponentLoaded to the runtime instance', () => {
    const plugin = ObservabilityPlugin({ level: 'verbose' });
    const instance = {} as {
      markComponentLoaded?: ReturnType<
        typeof createObservability
      >['markComponentLoaded'];
    };

    expect(plugin.name).toBe('observability-plugin');
    plugin.apply?.(
      instance as unknown as Parameters<NonNullable<typeof plugin.apply>>[0],
    );

    expect(typeof instance.markComponentLoaded).toBe('function');
  });

  it('returns a chrome runtime plugin without attaching instance APIs', () => {
    const plugin = ChromeObservabilityPlugin({ level: 'verbose' });
    const instance = {} as {
      markComponentLoaded?: ReturnType<
        typeof createObservability
      >['markComponentLoaded'];
    };

    expect(plugin.name).toBe('observability-plugin:chrome-extension');
    plugin.apply?.(
      instance as unknown as Parameters<NonNullable<typeof plugin.apply>>[0],
    );

    expect(instance.markComponentLoaded).toBeUndefined();
  });

  it('exposes chrome reports under the fixed browser scope', () => {
    const previousFederation = (globalThis as any).__FEDERATION__;

    try {
      (globalThis as any).__FEDERATION__ = {};
      const plugin = ChromeObservabilityPlugin({
        level: 'verbose',
        console: false,
        browser: {
          enabled: true,
          scope: 'ignored_custom_scope',
        },
      });

      plugin.beforeRequest?.({
        id: 'remote/Button',
        options: {},
        origin: enabledOrigin,
      } as any);

      expect(
        (globalThis as any).__FEDERATION__.__OBSERVABILITY__.chrome_extension,
      ).toBeDefined();
      expect(
        (globalThis as any).__FEDERATION__.__OBSERVABILITY__
          .ignored_custom_scope,
      ).toBeUndefined();
    } finally {
      (globalThis as any).__FEDERATION__ = previousFederation;
    }
  });

  it('does not wrap a remote React function component unless callback injection is explicitly enabled', async () => {
    const react = {
      createElement: vi.fn((type: unknown, props?: unknown) => ({
        type,
        props,
      })),
    };
    const observability = createObservability({
      level: 'verbose',
      react: {
        enabled: true,
      },
    });

    function RemoteButton() {
      return null;
    }

    const wrapped = await observability.plugin.onLoad?.({
      id: 'remote/Button',
      pkgNameOrAlias: 'remote',
      expose: './Button',
      remote: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      options: {},
      origin: {
        ...enabledOrigin,
        loadShareSync: () => () => react,
      },
      exposeModule: RemoteButton,
      exposeModuleFactory: undefined,
      moduleInstance: {},
    } as any);

    expect(wrapped).toBeUndefined();
    expect(react.createElement).not.toHaveBeenCalled();
    expect(observability.getEvents()).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'component',
        }),
      ]),
    );
  });

  it('injects the producer loaded callback when explicitly enabled', async () => {
    const react = {
      createElement: vi.fn((type: unknown, props?: unknown) => ({
        type,
        props,
      })),
    };
    const observability = createObservability({
      level: 'verbose',
      react: {
        injectLoadedCallback: true,
      },
    });

    function RemoteButton() {
      return null;
    }

    const wrapped = await observability.plugin.onLoad?.({
      id: 'remote/Button',
      pkgNameOrAlias: 'remote',
      expose: './Button',
      remote: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      options: {},
      origin: {
        ...enabledOrigin,
        loadShareSync: () => () => react,
      },
      exposeModule: RemoteButton,
      exposeModuleFactory: undefined,
      moduleInstance: {},
    } as any);

    expect(typeof wrapped).toBe('function');

    (wrapped as (props: Record<string, unknown>) => unknown)({
      label: 'Save',
    });

    const renderedProps = react.createElement.mock.calls[0]?.[1] as {
      label: string;
      onMFRemoteLoaded: (options?: {
        componentName?: string;
        metadata?: Record<string, unknown>;
      }) => void;
    };

    expect(react.createElement).toHaveBeenCalledWith(
      RemoteButton,
      expect.objectContaining({
        label: 'Save',
        onMFRemoteLoaded: expect.any(Function),
      }),
    );
    expect(observability.getEvents()).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: expect.stringContaining('component:react-'),
        }),
      ]),
    );

    renderedProps.onMFRemoteLoaded({
      metadata: {
        readySource: 'producer',
      },
    });

    expect(observability.getEvents()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'component',
          status: 'success',
          eventName: 'component:business-loaded',
          source: 'business',
          componentName: 'RemoteButton',
          metadata: {
            readySource: 'producer',
          },
        }),
      ]),
    );

    react.createElement.mockClear();

    function RemoteCard() {
      return null;
    }

    const remoteModule = {
      default: RemoteCard,
      named: 'value',
    };
    const wrappedModule = await observability.plugin.onLoad?.({
      id: 'remote/Card',
      pkgNameOrAlias: 'remote',
      expose: './Card',
      remote: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      options: {},
      origin: {
        ...enabledOrigin,
        loadShareSync: () => () => react,
      },
      exposeModule: remoteModule,
      exposeModuleFactory: undefined,
      moduleInstance: {},
    } as any);

    expect(wrappedModule).toBeUndefined();
    expect(remoteModule.named).toBe('value');
    expect(remoteModule.default).toEqual(expect.any(Function));

    const WrappedDefault = remoteModule.default as (
      props: Record<string, unknown>,
    ) => unknown;
    WrappedDefault({});

    expect(react.createElement).toHaveBeenCalledWith(
      RemoteCard,
      expect.objectContaining({
        onMFRemoteLoaded: expect.any(Function),
      }),
    );
  });

  it('injects the producer loaded callback for build-time remote factories', async () => {
    const react = {
      createElement: vi.fn((type: unknown, props?: unknown) => ({
        type,
        props,
      })),
    };
    const observability = createObservability({
      level: 'verbose',
      react: {
        injectLoadedCallback: true,
      },
    });

    function RemoteProvider() {
      return null;
    }

    const wrappedFactory = await observability.plugin.onLoad?.({
      id: 'provider',
      pkgNameOrAlias: 'provider',
      expose: '.',
      remote: {
        name: 'provider',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      options: {},
      origin: {
        ...enabledOrigin,
        loadShareSync: () => () => react,
      },
      exposeModule: undefined,
      exposeModuleFactory: () => RemoteProvider,
      moduleInstance: {},
    } as any);

    expect(typeof wrappedFactory).toBe('function');

    const WrappedProvider = (wrappedFactory as () => unknown)();
    expect(typeof WrappedProvider).toBe('function');

    (WrappedProvider as (props: Record<string, unknown>) => unknown)({});

    const renderedProps = react.createElement.mock.calls[0]?.[1] as {
      onMFRemoteLoaded: (options?: {
        componentName?: string;
        metadata?: Record<string, unknown>;
      }) => void;
    };

    expect(react.createElement).toHaveBeenCalledWith(
      RemoteProvider,
      expect.objectContaining({
        onMFRemoteLoaded: expect.any(Function),
      }),
    );

    renderedProps.onMFRemoteLoaded({
      metadata: {
        readySource: 'producer',
      },
    });

    expect(observability.getEvents()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'component',
          status: 'success',
          eventName: 'component:business-loaded',
          source: 'business',
          componentName: 'RemoteProvider',
          metadata: {
            readySource: 'producer',
          },
        }),
      ]),
    );

    react.createElement.mockClear();

    function ReadonlyRemoteProvider() {
      return null;
    }

    const readonlyModule = {};
    Object.defineProperty(readonlyModule, 'default', {
      configurable: false,
      enumerable: true,
      get: () => ReadonlyRemoteProvider,
    });

    const wrappedReadonlyFactory = await observability.plugin.onLoad?.({
      id: 'provider',
      pkgNameOrAlias: 'provider',
      expose: '.',
      remote: {
        name: 'provider',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      options: {},
      origin: {
        ...enabledOrigin,
        loadShareSync: () => () => react,
      },
      exposeModule: undefined,
      exposeModuleFactory: () => readonlyModule,
      moduleInstance: {},
    } as any);

    const wrappedReadonlyModule = (
      wrappedReadonlyFactory as () => Record<string, unknown>
    )();

    expect(wrappedReadonlyModule).not.toBe(readonlyModule);
    expect(wrappedReadonlyModule.default).toEqual(expect.any(Function));

    (
      wrappedReadonlyModule.default as (
        props: Record<string, unknown>,
      ) => unknown
    )({});

    expect(react.createElement).toHaveBeenCalledWith(
      ReadonlyRemoteProvider,
      expect.objectContaining({
        onMFRemoteLoaded: expect.any(Function),
      }),
    );
  });

  it('wraps explicitly matched React remotes even when the compiled component name is not capitalized', async () => {
    const react = {
      createElement: vi.fn((type: unknown, props?: unknown) => ({
        type,
        props,
      })),
    };
    const observability = createObservability({
      level: 'verbose',
      react: {
        injectLoadedCallback: true,
        remoteIds: ['remote/profile'],
      },
    });

    const compiledRemote = function profile_widget() {
      return null;
    };

    const unmatched = await observability.plugin.onLoad?.({
      id: 'remote/settings',
      pkgNameOrAlias: 'remote',
      expose: './settings',
      remote: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      options: {},
      origin: {
        ...enabledOrigin,
        loadShareSync: () => () => react,
      },
      exposeModule: compiledRemote,
      exposeModuleFactory: undefined,
      moduleInstance: {},
    } as any);

    expect(unmatched).toBeUndefined();

    const matched = await observability.plugin.onLoad?.({
      id: 'remote/profile',
      pkgNameOrAlias: 'remote',
      expose: './profile',
      remote: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      options: {},
      origin: {
        ...enabledOrigin,
        loadShareSync: () => () => react,
      },
      exposeModule: compiledRemote,
      exposeModuleFactory: undefined,
      moduleInstance: {},
    } as any);

    expect(typeof matched).toBe('function');

    (matched as (props: Record<string, unknown>) => unknown)({});

    expect(react.createElement).toHaveBeenCalledWith(
      compiledRemote,
      expect.objectContaining({
        onMFRemoteLoaded: expect.any(Function),
      }),
    );
  });

  it('injects the producer loaded callback even when React cannot be resolved from shared scope', async () => {
    const observability = createObservability({
      level: 'verbose',
      react: {
        injectLoadedCallback: true,
      },
    });

    function RemotePanel(props: {
      onMFRemoteLoaded?: (options?: {
        metadata?: Record<string, unknown>;
      }) => void;
    }) {
      props.onMFRemoteLoaded?.({
        metadata: {
          readySource: 'producer',
        },
      });
      return 'rendered';
    }

    const wrapped = await observability.plugin.onLoad?.({
      id: 'remote/Panel',
      pkgNameOrAlias: 'remote',
      expose: './Panel',
      remote: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      options: {},
      origin: {
        ...enabledOrigin,
        loadShareSync: () => false,
        loadShare: async () => false,
      },
      exposeModule: RemotePanel,
      exposeModuleFactory: undefined,
      moduleInstance: {},
    } as any);

    expect(typeof wrapped).toBe('function');
    expect((wrapped as (props: Record<string, unknown>) => unknown)({})).toBe(
      'rendered',
    );
    expect(observability.getEvents()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'component',
          status: 'success',
          eventName: 'component:business-loaded',
          source: 'business',
          componentName: 'RemotePanel',
          metadata: {
            readySource: 'producer',
          },
        }),
      ]),
    );
  });

  it('does not record events when the plugin is disabled', async () => {
    const observability = createObservability({
      enabled: false,
      level: 'verbose',
    });

    await emitRemoteLoaded(observability);

    expect(observability.getEvents()).toHaveLength(0);
    expect(observability.getLatestReport()).toBeUndefined();
  });

  it('records a successful loadRemote report when enabled', async () => {
    const observability = createObservability({ level: 'verbose' });

    emitRemoteStart(observability);
    await emitRemoteLoaded(observability);

    const report = observability.getLatestReport();
    expect(report?.status).toBe('success');
    expect(report?.requestId).toBe('remote/Button');
    expect(report?.remote?.name).toBe('remote');
    expect(report?.summary).toMatchObject({
      runtimeLoaded: true,
      loadCompleted: false,
      componentLoaded: false,
      outcome: 'runtime-loaded',
      lastPhase: 'loadRemote',
    });
    expect(report?.summary.phases.loadRemote).toMatchObject({
      status: 'success',
      duration: expect.any(Number),
    });
    expect(report?.diagnosis).toMatchObject({
      title: 'Remote loaded successfully',
      status: 'success',
      outcome: 'runtime-loaded',
      ownerHint: 'remote',
      facts: expect.objectContaining({
        requestId: 'remote/Button',
        remoteName: 'remote',
        runtimeLoaded: true,
        componentLoaded: false,
      }),
      completedPhases: ['loadRemote'],
      actions: [],
    });
    expect(report?.events).toHaveLength(2);
  });

  it('posts events to the local collector when enabled', () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true }));
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      configurable: true,
      writable: true,
    });

    try {
      const observability = createObservability({
        level: 'verbose',
        collector: true,
      });

      emitRemoteStart(observability);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        'http://127.0.0.1:17891/__mf_observability',
      );

      const requestInit = fetchMock.mock.calls[0]?.[1] as {
        body: string;
        credentials: string;
        mode: string;
      };
      const payload = JSON.parse(requestInit.body);

      expect(requestInit).toMatchObject({
        credentials: 'omit',
        mode: 'cors',
      });
      expect(payload).toMatchObject({
        schemaVersion: 1,
        source: 'browser',
        kind: 'event',
        event: {
          phase: 'loadRemote',
          status: 'start',
          requestId: 'remote/Button',
        },
        report: {
          requestId: 'remote/Button',
          status: 'pending',
        },
      });
    } finally {
      if (originalFetch) {
        Object.defineProperty(globalThis, 'fetch', {
          value: originalFetch,
          configurable: true,
          writable: true,
        });
      } else {
        Reflect.deleteProperty(globalThis, 'fetch');
      }
    }
  });

  it('posts events to the browser devtools channel when enabled', () => {
    const originalPostMessage = (globalThis as { postMessage?: unknown })
      .postMessage;
    const postMessageMock = vi.fn();
    Object.defineProperty(globalThis, 'postMessage', {
      value: postMessageMock,
      configurable: true,
      writable: true,
    });

    try {
      const observability = createObservability({
        level: 'verbose',
        console: false,
        browser: {
          enabled: true,
          scope: 'runtime_host',
        },
        devtools: true,
      });

      emitRemoteStart(observability);

      expect(postMessageMock).toHaveBeenCalledTimes(1);
      expect(postMessageMock.mock.calls[0]?.[1]).toBe('*');
      expect(postMessageMock.mock.calls[0]?.[0]).toMatchObject({
        schemaVersion: 1,
        source: 'module-federation/observability',
        kind: 'event',
        scope: 'host',
        event: {
          phase: 'loadRemote',
          status: 'start',
          requestId: 'remote/Button',
        },
        report: {
          requestId: 'remote/Button',
          status: 'pending',
        },
      });
    } finally {
      if (originalPostMessage) {
        Object.defineProperty(globalThis, 'postMessage', {
          value: originalPostMessage,
          configurable: true,
          writable: true,
        });
      } else {
        Reflect.deleteProperty(globalThis, 'postMessage');
      }
    }
  });

  it('omits undefined fields from public snapshots', async () => {
    const observability = createObservability({
      level: 'verbose',
    });

    emitRemoteStart(observability);
    await emitRemoteLoaded(observability);

    const report = observability.getLatestReport();
    const events = observability.getEvents();

    expect(report).toBeDefined();
    expect(hasUndefinedField(report)).toBe(false);
    expect(hasUndefinedField(events)).toBe(false);
  });

  it('records a complete loadRemote event as the final runtime outcome', async () => {
    const observability = createObservability({ level: 'verbose' });

    emitRemoteStart(observability);
    await emitRemoteLoaded(observability);
    emitRemoteComplete(observability);

    const report = observability.getLatestReport();
    expect(report?.status).toBe('success');
    expect(report?.summary).toMatchObject({
      runtimeLoaded: true,
      loadCompleted: true,
      componentLoaded: false,
      outcome: 'runtime-loaded',
      lastPhase: 'loadRemote',
    });
  });

  it('records manifest and remoteEntry lifecycle hooks without observability events', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    observability.plugin.beforeLoadRemoteSnapshot?.({
      origin: enabledOrigin,
    } as any);
    observability.plugin.loadSnapshot?.({
      moduleInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
    } as any);
    observability.plugin.loadRemoteSnapshot?.({
      moduleInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      manifestUrl: 'http://localhost:3001/mf-manifest.json',
      remoteSnapshot: {
        version: 'http://localhost:3001/mf-manifest.json',
        remoteEntry: 'http://localhost:3001/remoteEntry.js',
      },
      from: 'manifest',
    } as any);
    observability.plugin.loadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js',
      },
      origin: enabledOrigin,
    } as any);
    observability.plugin.afterLoadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js',
      },
      origin: enabledOrigin,
    } as any);

    expect(observability.getEvents()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'manifest',
          status: 'start',
          lifecycle: 'loadSnapshot',
        }),
        expect.objectContaining({
          phase: 'manifest',
          status: 'success',
          lifecycle: 'loadRemoteSnapshot',
        }),
        expect.objectContaining({
          phase: 'remoteEntry',
          status: 'start',
          lifecycle: 'loadEntry',
        }),
        expect.objectContaining({
          phase: 'remoteEntry',
          status: 'success',
          lifecycle: 'afterLoadEntry',
        }),
      ]),
    );
  });

  it('records repeated manifest snapshot loads as cached success', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const moduleInfo = {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    };

    observability.plugin.beforeLoadRemoteSnapshot?.({
      origin: enabledOrigin,
    } as any);
    observability.plugin.loadSnapshot?.({
      moduleInfo,
    } as any);
    observability.plugin.loadRemoteSnapshot?.({
      moduleInfo,
      manifestUrl: moduleInfo.entry,
      remoteSnapshot: {
        version: moduleInfo.entry,
        remoteEntry: 'http://localhost:3001/remoteEntry.js',
      },
      from: 'manifest',
    } as any);

    observability.plugin.loadSnapshot?.({
      moduleInfo,
    } as any);

    const manifestEvents = observability
      .getEvents()
      .filter((event) => event.phase === 'manifest');

    expect(manifestEvents).toEqual([
      expect.objectContaining({
        status: 'start',
        message: 'manifest:load-start',
      }),
      expect.objectContaining({
        status: 'success',
        message: 'manifest:resolved',
      }),
      expect.objectContaining({
        status: 'success',
        message: 'manifest:cached',
        cached: true,
      }),
    ]);
    expect(
      observability.getLatestReport()?.summary.phases.manifest,
    ).toMatchObject({
      status: 'success',
      cached: true,
    });
  });

  it('keeps manifest, remoteEntry, and runtime load events in the same remote trace', async () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    emitRemoteStart(observability, {
      id: '@cloud-public/ai-assistant/AiAssistant',
      options: {
        remotes: [
          {
            name: '@cloud-public/ai-assistant',
            entry: 'https://example.com/vmok-manifest.json',
            type: 'global',
          },
        ],
      },
    });
    observability.plugin.beforeLoadRemoteSnapshot?.({
      origin: enabledOrigin,
    } as any);
    observability.plugin.loadSnapshot?.({
      moduleInfo: {
        name: '@cloud-public/ai-assistant',
        entry: 'https://example.com/vmok-manifest.json',
      },
    } as any);
    observability.plugin.loadRemoteSnapshot?.({
      moduleInfo: {
        name: '@cloud-public/ai-assistant',
        entry: 'https://example.com/vmok-manifest.json',
      },
      manifestUrl: 'https://example.com/vmok-manifest.json',
      remoteSnapshot: {
        version: 'https://example.com/vmok-manifest.json',
        remoteEntry: 'https://example.com/remoteEntry.js',
      },
      from: 'manifest',
    } as any);
    observability.plugin.loadEntry?.({
      remoteInfo: {
        name: '@cloud-public/ai-assistant',
        entry: 'https://example.com/remoteEntry.js',
      },
      origin: enabledOrigin,
    } as any);
    await emitRemoteLoaded(observability, {
      id: '@cloud-public/ai-assistant/AiAssistant',
      remote: {
        name: '@cloud-public/ai-assistant',
        entry: 'https://example.com/vmok-manifest.json',
      },
    });

    const reports = observability.getReports();
    expect(reports).toHaveLength(1);
    expect(reports[0].status).toBe('success');
    expect(reports[0].runtimeVersion).toBe('2.5.0');
    expect(reports[0].summary.outcome).toBe('runtime-loaded');
    expect(reports[0].diagnosis.title).toBe('Remote loaded successfully');
    expect(reports[0].events.map((event) => event.phase)).toEqual([
      'loadRemote',
      'manifest',
      'manifest',
      'remoteEntry',
      'loadRemote',
    ]);
  });

  it('uses the applied instance version when hook origin version is missing', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    observability.plugin.apply?.({
      version: '2.5.0',
    } as any);

    observability.plugin.beforeRequest?.({
      id: 'remote/Button',
      origin: {
        options: {
          name: 'host',
        },
      },
    } as any);

    const report = observability.getLatestReport();

    expect(report?.runtimeVersion).toBe('2.5.0');
    expect(report?.events[0].runtimeVersion).toBe('2.5.0');
  });

  it('does not return hook args from the default browser entry', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const beforeRequestArgs = {
      id: 'remote/Button',
      options: {},
      origin: enabledOrigin,
    };
    const afterResolveArgs = {
      id: 'remote/Button',
      expose: './Button',
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      origin: enabledOrigin,
    };
    const loadRemoteSnapshotArgs = {
      options: {},
      moduleInfo: {
        name: 'remote',
      },
      remoteSnapshot: {
        remoteEntry: 'http://localhost:3001/remoteEntry.js',
      },
      from: 'global',
    };

    expect(observability.plugin.beforeRequest?.(beforeRequestArgs as any)).toBe(
      undefined,
    );
    expect(observability.plugin.afterResolve?.(afterResolveArgs as any)).toBe(
      undefined,
    );
    expect(
      observability.plugin.loadRemoteSnapshot?.(loadRemoteSnapshotArgs as any),
    ).toBe(undefined);
  });

  it('returns original args from chrome remote waterfall hooks for old runtimes', () => {
    const plugin = ChromeObservabilityPlugin({
      level: 'verbose',
      console: false,
    });
    const beforeRequestArgs = {
      id: 'remote/Button',
      options: {},
      origin: enabledOrigin,
    };
    const afterResolveArgs = {
      id: 'remote/Button',
      expose: './Button',
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      origin: enabledOrigin,
    };
    const loadRemoteSnapshotArgs = {
      options: {},
      moduleInfo: {
        name: 'remote',
      },
      remoteSnapshot: {
        remoteEntry: 'http://localhost:3001/remoteEntry.js',
      },
      from: 'global',
    };

    expect(plugin.beforeRequest?.(beforeRequestArgs as any)).toBe(
      beforeRequestArgs,
    );
    expect(plugin.afterResolve?.(afterResolveArgs as any)).toBe(
      afterResolveArgs,
    );
    expect(plugin.loadRemoteSnapshot?.(loadRemoteSnapshotArgs as any)).toBe(
      loadRemoteSnapshotArgs,
    );
  });

  it('does not attach global moduleInfo for unrelated runtime failures', () => {
    const originalFederation = (globalThis as any).__FEDERATION__;

    try {
      (globalThis as any).__FEDERATION__ = {
        moduleInfo: {
          'remote:http://localhost:3001/mf-manifest.json': {
            publicPath: 'https://cdn.example.com/remote/',
            modules: [{ moduleName: 'Button' }],
            shared: [{ sharedName: 'react' }],
          },
        },
      };

      const observability = createObservability({
        level: 'verbose',
        console: false,
      });

      emitRemoteStart(observability);
      emitManifestError(observability, {
        error: new Error(
          '[ Federation Runtime ]: Failed to get manifest. #RUNTIME-003',
        ),
      });

      expect(observability.getLatestReport()?.moduleInfo).toBeUndefined();
    } finally {
      if (originalFederation) {
        (globalThis as any).__FEDERATION__ = originalFederation;
      } else {
        delete (globalThis as any).__FEDERATION__;
      }
    }
  });

  it('attaches clipped global moduleInfo only for snapshot dependent failures', () => {
    const originalFederation = (globalThis as any).__FEDERATION__;

    try {
      (globalThis as any).__FEDERATION__ = {
        moduleInfo: {
          'remote:http://localhost:3001/mf-manifest.json?token=secret#hash': {
            publicPath: 'https://cdn.example.com/remote/?v=20260508#hash',
            getPublicPath:
              'return "https://cdn.example.com/remote/?v=20260508#hash";',
            remoteEntry:
              'https://cdn.example.com/remote/remoteEntry.js?v=20260508#hash',
            globalName: 'remote_global',
            modules: [{ moduleName: 'Button', assets: { js: ['large.js'] } }],
            shared: [{ sharedName: 'react', assets: { js: ['large.js'] } }],
          },
          unrelated: {
            publicPath: 'https://cdn.example.com/unrelated/',
            modules: [{ moduleName: 'Unused' }],
            shared: [{ sharedName: 'react' }],
          },
        },
      };

      const observability = createObservability({
        level: 'verbose',
        console: false,
      });

      emitRemoteStart(observability);
      emitRemoteError(observability, {
        error: new Error(
          '[ Federation Runtime ]: Failed to get remote snapshot. #RUNTIME-007',
        ),
      });

      const report = observability.getLatestReport();

      expect(report?.ownerHint).toBe('host');
      expect(report?.diagnosis?.title).toBe(
        'Deployment moduleInfo did not match the requested remote',
      );
      expect(report?.moduleInfo).toMatchObject({
        reason: 'remote-snapshot',
        clipped: true,
        totalCount: 2,
        matchedCount: 1,
        entries: [
          {
            name: 'remote:http://localhost:3001/mf-manifest.json?token=secret#hash',
            publicPath: 'https://cdn.example.com/remote/?v=20260508#hash',
            getPublicPath:
              'return "https://cdn.example.com/remote/?v=20260508#hash";',
            remoteEntry:
              'https://cdn.example.com/remote/remoteEntry.js?v=20260508#hash',
            globalName: 'remote_global',
          },
        ],
      });
      expect(report?.diagnosis?.facts).toMatchObject({
        moduleInfoReason: 'remote-snapshot',
        moduleInfoTotalCount: 2,
        moduleInfoMatchedCount: 1,
        moduleInfoNames:
          'remote:http://localhost:3001/mf-manifest.json?token=secret#hash',
      });
      expect(report?.diagnosis?.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'check-module-info',
            ownerHint: 'host',
          }),
        ]),
      );
      expect(JSON.stringify(report?.moduleInfo)).not.toContain('modules');
      expect(JSON.stringify(report?.moduleInfo)).not.toContain('shared');
      expect(JSON.stringify(report?.moduleInfo)).toContain('secret');
      expect(JSON.stringify(report?.moduleInfo)).toContain('token=');
    } finally {
      if (originalFederation) {
        (globalThis as any).__FEDERATION__ = originalFederation;
      } else {
        delete (globalThis as any).__FEDERATION__;
      }
    }
  });

  it('treats a recovered complete event as a recovered runtime outcome', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    emitRemoteStart(observability);
    expect(emitRemoteError(observability)).toBeUndefined();
    emitRemoteComplete(observability, {
      error: new Error('remote load failed'),
      recovered: true,
    });

    const report = observability.getLatestReport();
    expect(report?.status).toBe('success');
    expect(report?.failedPhase).toBe('loadRemote');
    expect(report?.summary).toMatchObject({
      recovered: true,
      runtimeLoaded: true,
      loadCompleted: true,
      outcome: 'recovered',
      error: {
        failedPhase: 'loadRemote',
      },
    });
    expect(report?.summary.flags).toMatchObject({
      fallback: true,
      recovered: true,
    });
  });

  it('keeps summary level compact while preserving phase durations', () => {
    const observability = createObservability({
      level: 'summary',
      console: false,
    });

    emitRemoteStart(observability);
    emitExposePhase(observability, 'beforeGetExpose');
    emitExposePhase(observability, 'afterGetExpose');

    const report = observability.getLatestReport();

    expect(report?.events.map((event) => event.status)).toEqual(['success']);
    expect(report?.events[0]).toMatchObject({
      phase: 'expose',
      status: 'success',
      duration: expect.any(Number),
    });
    expect(report?.summary.phases.expose).toMatchObject({
      status: 'success',
      duration: expect.any(Number),
    });
  });

  it('preserves urls and error message fields for observability', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    emitManifestError(observability, {
      error: new Error(
        'authorization=demo-secret failed at http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
      ),
    });

    const output = JSON.stringify(observability.getLatestReport());
    expect(output).toContain(
      'http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
    );
    expect(output).toContain('demo-secret');
    expect(output).toContain('token=');
    expect(output).toContain('#hash');
  });

  it('keeps the first specific failed phase when loadRemote closes the trace', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    emitRemoteStart(observability, {
      remote: {
        name: 'remote',
      },
    });
    emitManifestError(observability, {
      id: 'remote/Button',
      remote: {
        name: 'remote',
      },
      error: new Error('manifest failed'),
    });
    expect(emitRemoteError(observability)).toBeUndefined();
    emitRemoteComplete(observability, {
      remote: {
        name: 'remote',
      },
      error: new Error('outer loadRemote failed'),
    });

    const report = observability.getLatestReport();
    expect(report?.status).toBe('error');
    expect(report?.failedPhase).toBe('manifest');
    expect(report?.summary).toMatchObject({
      loadCompleted: true,
      runtimeLoaded: false,
      componentLoaded: false,
      outcome: 'failed',
    });
  });

  it('attaches loaded-before evidence from other consumers on remote failures', () => {
    const originalFederation = (globalThis as any).__FEDERATION__;
    const { currentOrigin, federation } = createLoadedBeforeFederationFixture();

    try {
      (globalThis as any).__FEDERATION__ = federation;

      const observability = createObservability({
        level: 'verbose',
        console: false,
      });

      emitRemoteError(observability, {
        origin: currentOrigin,
        remote: {
          name: 'provider',
          entryGlobalName: 'provider_global',
          entry: 'http://localhost:3001/mf-manifest.json',
        },
        expose: './Button',
      });

      const report = observability.getLatestReport();
      expect(report?.loadedBefore).toEqual({
        producer: true,
        expose: true,
        consumers: [
          {
            name: 'consumer_a',
            remoteEntryExports: true,
            containerInitialized: true,
            exposes: ['./Button', './Card'],
          },
        ],
      });
      expect(report?.events[0].loadedBefore).toEqual(report?.loadedBefore);
      expect(
        report?.loadedBefore?.consumers.some(
          (consumer) => consumer.name === 'consumer_b',
        ),
      ).toBe(false);
      expect(hasUndefinedField(report)).toBe(false);
    } finally {
      if (originalFederation) {
        (globalThis as any).__FEDERATION__ = originalFederation;
      } else {
        delete (globalThis as any).__FEDERATION__;
      }
    }
  });

  it('attaches loaded-before evidence on successful verbose development remote loads', async () => {
    const originalFederation = (globalThis as any).__FEDERATION__;
    const { currentOrigin, federation } = createLoadedBeforeFederationFixture();

    try {
      (globalThis as any).__FEDERATION__ = federation;

      const observability = createObservability({
        level: 'verbose',
        console: false,
        browser: {
          enabled: true,
          mode: 'development',
        },
      });

      await emitRemoteLoaded(observability, {
        origin: currentOrigin,
        remote: {
          name: 'provider',
          entryGlobalName: 'provider_global',
          entry: 'http://localhost:3001/mf-manifest.json',
        },
        expose: './Button',
      });

      const report = observability.getLatestReport();
      expect(report?.status).toBe('success');
      expect(report?.loadedBefore).toEqual({
        producer: true,
        expose: true,
        consumers: [
          {
            name: 'consumer_a',
            remoteEntryExports: true,
            containerInitialized: true,
            exposes: ['./Button', './Card'],
          },
        ],
      });
    } finally {
      if (originalFederation) {
        (globalThis as any).__FEDERATION__ = originalFederation;
      } else {
        delete (globalThis as any).__FEDERATION__;
      }
    }
  });

  it('does not attach loaded-before evidence on successful production remote loads', async () => {
    const originalFederation = (globalThis as any).__FEDERATION__;
    const { currentOrigin, federation } = createLoadedBeforeFederationFixture();

    try {
      (globalThis as any).__FEDERATION__ = federation;

      const observability = createObservability({
        level: 'verbose',
        console: false,
        browser: {
          enabled: true,
          mode: 'production',
        },
      });

      await emitRemoteLoaded(observability, {
        origin: currentOrigin,
        remote: {
          name: 'provider',
          entryGlobalName: 'provider_global',
          entry: 'http://localhost:3001/mf-manifest.json',
        },
        expose: './Button',
      });

      expect(observability.getLatestReport()?.status).toBe('success');
      expect(observability.getLatestReport()?.loadedBefore).toBeUndefined();
    } finally {
      if (originalFederation) {
        (globalThis as any).__FEDERATION__ = originalFederation;
      } else {
        delete (globalThis as any).__FEDERATION__;
      }
    }
  });

  it('omits loaded-before evidence when no existing producer cache matches', () => {
    const originalFederation = (globalThis as any).__FEDERATION__;

    try {
      (globalThis as any).__FEDERATION__ = {
        __INSTANCES__: [
          {
            options: {
              name: 'consumer_a',
            },
            moduleCache: new Map([
              [
                'other',
                {
                  remoteInfo: {
                    name: 'other',
                    entryGlobalName: 'other_global',
                  },
                },
              ],
            ]),
          },
        ],
      };

      const observability = createObservability({
        level: 'verbose',
        console: false,
      });

      emitRemoteError(observability, {
        remote: {
          name: 'provider',
          entryGlobalName: 'provider_global',
        },
        expose: './Button',
      });

      expect(observability.getLatestReport()?.loadedBefore).toBeUndefined();
      expect(
        observability.getLatestReport()?.events[0].loadedBefore,
      ).toBeUndefined();
    } finally {
      if (originalFederation) {
        (globalThis as any).__FEDERATION__ = originalFederation;
      } else {
        delete (globalThis as any).__FEDERATION__;
      }
    }
  });

  it('records runtime error code and manifest context for RUNTIME-003', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const error = new Error(
      [
        '[ Federation Runtime ]: Failed to get manifest. #RUNTIME-003',
        'args: {"manifestUrl":"http://localhost:3001/mf-manifest.json?token=demo-secret#hash","moduleName":"remote"}',
        'Original Error Message:',
        ' NetworkError: token=demo-secret failed',
      ].join('\n'),
    );

    emitRemoteStart(observability);
    emitManifestError(observability, { error });

    const report = observability.getLatestReport();
    const event = report?.events.find((item) => item.phase === 'manifest');
    const output = JSON.stringify(report);

    expect(event).toMatchObject({
      status: 'error',
      errorCode: 'RUNTIME-003',
      ownerHint: 'host',
      retryable: true,
      sanitizedUrl:
        'http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
      errorContext: expect.objectContaining({
        lifecycle: 'afterResolve',
        remoteName: 'remote',
        url: 'http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
      }),
    });
    expect(report).toMatchObject({
      status: 'error',
      failedPhase: 'manifest',
      errorCode: 'RUNTIME-003',
      ownerHint: 'host',
      retryable: true,
      summary: {
        error: expect.objectContaining({
          errorCode: 'RUNTIME-003',
          failedPhase: 'manifest',
          lifecycle: 'afterResolve',
          ownerHint: 'host',
          retryable: true,
        }),
      },
      diagnosis: {
        title: 'Manifest could not be loaded',
        status: 'error',
        outcome: 'failed',
        ownerHint: 'host',
        failedPhase: 'manifest',
        errorCode: 'RUNTIME-003',
        docLink: expect.stringContaining('/guide/troubleshooting/runtime'),
        facts: expect.objectContaining({
          errorCode: 'RUNTIME-003',
          failedPhase: 'manifest',
          remoteName: 'remote',
          url: 'http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
          retryable: true,
        }),
        actions: [
          expect.objectContaining({
            id: 'check-manifest-url',
            ownerHint: 'host',
          }),
          expect.objectContaining({
            id: 'check-network',
            ownerHint: 'network',
          }),
        ],
      },
    });
    expect(output).toContain('demo-secret');
    expect(output).toContain('token=');
    expect(output).toContain('#hash');
  });

  it('records host remote summary for RUNTIME-004 match failures', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    emitRemoteStart(observability, {
      id: 'missing/Button',
    });
    observability.plugin.afterMatchRemote?.({
      id: 'missing/Button',
      options: {
        name: 'host',
        remotes: [
          {
            name: 'remote',
            alias: 'known-remote',
            entry: 'http://localhost:3001/mf-manifest.json',
          },
        ],
      },
      origin: enabledOrigin,
      error: new Error(
        '[ Federation Runtime ]: Failed to locate remote. #RUNTIME-004',
      ),
    } as any);

    const report = observability.getLatestReport();

    expect(report).toMatchObject({
      status: 'error',
      failedPhase: 'matchRemote',
      requestId: 'missing/Button',
      errorCode: 'RUNTIME-004',
      ownerHint: 'host',
      retryable: false,
      errorContext: expect.objectContaining({
        requestId: 'missing/Button',
        hostRemotes: 'known-remote',
      }),
      diagnosis: {
        title: 'Remote was not found in host remotes',
        ownerHint: 'host',
        errorCode: 'RUNTIME-004',
        facts: expect.objectContaining({
          requestId: 'missing/Button',
          hostRemotes: 'known-remote',
        }),
        actions: [
          expect.objectContaining({
            id: 'check-host-remotes',
            ownerHint: 'host',
          }),
        ],
      },
    });
  });

  it('records remoteEntry global context for RUNTIME-001', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    observability.plugin.loadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js?token=demo-secret',
        entryGlobalName: 'remote_global',
        type: 'global',
      },
      origin: enabledOrigin,
    } as any);
    observability.plugin.afterLoadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js?token=demo-secret',
        entryGlobalName: 'remote_global',
        type: 'global',
      },
      origin: enabledOrigin,
      error: new Error(
        '[ Federation Runtime ]: Failed to get remoteEntry exports. #RUNTIME-001',
      ),
    } as any);

    const report = observability.getLatestReport();
    const output = JSON.stringify(report);

    expect(report).toMatchObject({
      status: 'error',
      failedPhase: 'remoteEntry',
      errorCode: 'RUNTIME-001',
      ownerHint: 'remote',
      retryable: false,
      remote: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js?token=demo-secret',
        entryGlobalName: 'remote_global',
        type: 'global',
      },
      errorContext: expect.objectContaining({
        remoteName: 'remote',
        entryGlobalName: 'remote_global',
        url: 'http://localhost:3001/remoteEntry.js?token=demo-secret',
      }),
      diagnosis: {
        title: 'Remote entry global was not registered',
        ownerHint: 'remote',
        errorCode: 'RUNTIME-001',
        facts: expect.objectContaining({
          remoteName: 'remote',
          remoteEntry: 'http://localhost:3001/remoteEntry.js?token=demo-secret',
          entryGlobalName: 'remote_global',
        }),
        actions: [
          expect.objectContaining({
            id: 'check-remote-global',
            ownerHint: 'remote',
          }),
          expect.objectContaining({
            id: 'check-remote-entry',
            ownerHint: 'remote',
          }),
        ],
      },
    });
    expect(output).toContain('demo-secret');
    expect(output).toContain('token=');
  });

  it('classifies RUNTIME-008 remoteEntry resource failures', () => {
    const createReportForError = (error: Error) => {
      const observability = createObservability({
        level: 'verbose',
        console: false,
      });

      observability.plugin.afterLoadEntry?.({
        remoteInfo: {
          name: 'remote',
          entry: 'http://localhost:3001/remoteEntry.js',
        },
        origin: enabledOrigin,
        error,
      } as any);

      return observability.getLatestReport();
    };

    const networkReport = createReportForError(
      new Error(
        '[ Federation Runtime ]: Failed to load script resources. #RUNTIME-008\nOriginal Error Message:\n ScriptNetworkError: 404',
      ),
    );
    const timeoutReport = createReportForError(
      new Error(
        '[ Federation Runtime ]: Failed to load script resources. #RUNTIME-008\nOriginal Error Message:\n timeout loading remoteEntry',
      ),
    );
    const executionReport = createReportForError(
      new Error(
        '[ Federation Runtime ]: Failed to load script resources. #RUNTIME-008\nOriginal Error Message:\n ScriptExecutionError: boom',
      ),
    );

    expect(networkReport).toMatchObject({
      errorCode: 'RUNTIME-008',
      ownerHint: 'network',
      retryable: true,
      errorContext: expect.objectContaining({
        resourceErrorType: 'network',
      }),
      diagnosis: {
        title: 'Remote entry failed because of a network error',
        ownerHint: 'network',
        facts: expect.objectContaining({
          resourceErrorType: 'network',
        }),
        actions: [
          expect.objectContaining({
            id: 'check-network',
            ownerHint: 'network',
          }),
          expect.objectContaining({
            id: 'check-remote-entry',
            ownerHint: 'network',
          }),
        ],
      },
    });
    expect(timeoutReport).toMatchObject({
      errorCode: 'RUNTIME-008',
      ownerHint: 'network',
      retryable: true,
      errorContext: expect.objectContaining({
        resourceErrorType: 'timeout',
      }),
      diagnosis: {
        title: 'Remote entry request timed out',
        facts: expect.objectContaining({
          resourceErrorType: 'timeout',
        }),
      },
    });
    expect(executionReport).toMatchObject({
      errorCode: 'RUNTIME-008',
      ownerHint: 'remote',
      retryable: false,
      errorContext: expect.objectContaining({
        resourceErrorType: 'script-execution',
      }),
      diagnosis: {
        title: 'Remote entry loaded but failed during execution',
        ownerHint: 'remote',
        facts: expect.objectContaining({
          resourceErrorType: 'script-execution',
        }),
        actions: [
          expect.objectContaining({
            id: 'check-remote-entry',
            ownerHint: 'remote',
          }),
        ],
      },
    });
  });

  it('records detailed remote phases and keeps expose as the failed phase', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const exposeError = new Error('remote expose missing');

    emitRemoteStart(observability);
    emitRemoteMatch(observability);
    observability.plugin.beforeInitRemote?.({
      id: 'remote/Button',
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      origin: enabledOrigin,
    } as any);
    emitRemoteInit(observability);
    emitExposePhase(observability, 'beforeGetExpose');
    emitExposePhase(observability, 'afterGetExpose', {
      error: exposeError,
    });
    expect(
      emitRemoteError(observability, { error: exposeError }),
    ).toBeUndefined();
    emitRemoteComplete(observability, {
      error: exposeError,
    });

    const report = observability.getLatestReport();
    const phases = report?.events.map((event) => event.phase);
    const exposeEvent = report?.events.find(
      (event) => event.lifecycle === 'afterGetExpose',
    );

    expect(report?.status).toBe('error');
    expect(report?.failedPhase).toBe('expose');
    expect(phases).toEqual(
      expect.arrayContaining([
        'matchRemote',
        'remoteEntryInit',
        'expose',
        'loadRemote',
      ]),
    );
    expect(exposeEvent).toMatchObject({
      status: 'error',
      requestId: 'remote/Button',
      expose: './Button',
      errorMessage: 'remote expose missing',
      duration: expect.any(Number),
    });
  });

  it('records factory execution success with a phase duration', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    emitRemoteStart(observability);
    emitFactoryPhase(observability, 'beforeExecuteFactory');
    emitFactoryPhase(observability, 'afterExecuteFactory');

    const report = observability.getLatestReport();
    const factoryEvent = report?.events.find(
      (event) => event.lifecycle === 'afterExecuteFactory',
    );

    expect(report?.status).toBe('success');
    expect(factoryEvent).toMatchObject({
      phase: 'moduleFactory',
      status: 'success',
      duration: expect.any(Number),
    });
    expect(report?.summary.phases.moduleFactory).toMatchObject({
      status: 'success',
      duration: expect.any(Number),
    });
  });

  it('reads recent reports, filters by observability fields, and exports copies', async () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    vi.useFakeTimers();
    try {
      vi.setSystemTime(1000);
      await emitRemoteLoaded(observability);
      const buttonTraceId = observability.getLatestReport()?.traceId || '';

      vi.setSystemTime(2000);
      await emitRemoteLoaded(observability, {
        id: 'catalog/Card',
        expose: './Card',
        remote: {
          name: 'catalog',
          alias: 'catalogRemote',
          entry: 'http://localhost:3002/mf-manifest.json?env=dev',
        },
      });
      const cardTraceId = observability.getLatestReport()?.traceId || '';

      vi.setSystemTime(3000);
      observability.plugin.errorLoadShare?.({
        pkgName: 'react',
        shareInfo: createShared({
          shareConfig: {
            requiredVersion: '^99.0.0',
            singleton: true,
            strictVersion: true,
            eager: false,
          },
        }),
        shared: {
          react: [
            createShared({
              version: '18.3.1',
            }),
          ],
        },
        lifecycle: 'loadShare',
        origin: enabledOrigin,
        error: new Error('react version mismatch'),
      } as any);

      expect(observability.getReports()).toHaveLength(3);
      expect(
        observability.getReports({ limit: 2 }).map((report) => report.traceId),
      ).toEqual([observability.getLatestReport()?.traceId, cardTraceId]);

      expect(observability.findReports({ remote: 'catalog' })).toHaveLength(1);
      expect(
        observability.findReports({ remote: 'catalogRemote' })[0],
      ).toMatchObject({
        traceId: cardTraceId,
        expose: './Card',
      });
      expect(observability.findReports({ expose: 'Card' })[0]?.traceId).toBe(
        cardTraceId,
      );
      expect(observability.findReports({ shared: 'react' })[0]).toMatchObject({
        status: 'error',
        shared: {
          name: 'react',
        },
      });
      expect(observability.findReports({ status: 'error' })).toHaveLength(1);
      expect(observability.findReports({ outcome: 'failed' })).toHaveLength(1);

      const exported = observability.exportReport(buttonTraceId);
      expect(exported?.traceId).toBe(buttonTraceId);
      exported?.events.pop();
      expect(observability.getReport(buttonTraceId)?.events).toHaveLength(1);
      expect(observability.exportReport()?.traceId).toBe(
        observability.getLatestReport()?.traceId,
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('summarizes successful manifest, remoteEntry, cache, and runtime recovery facts', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    observability.plugin.beforeLoadRemoteSnapshot?.({
      origin: enabledOrigin,
    } as any);
    observability.plugin.loadSnapshot?.({
      moduleInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
    } as any);
    observability.plugin.loadRemoteSnapshot?.({
      moduleInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      manifestUrl: 'http://localhost:3001/mf-manifest.json',
      remoteSnapshot: {
        version: 'http://localhost:3001/mf-manifest.json',
        remoteEntry: 'http://localhost:3001/remoteEntry.js',
      },
      from: 'manifest',
    } as any);
    observability.plugin.loadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js',
      },
      origin: enabledOrigin,
    } as any);
    observability.plugin.afterLoadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js',
      },
      origin: enabledOrigin,
      recovered: true,
    } as any);

    const report = observability.getLatestReport();

    expect(report?.summary.phases.manifest).toMatchObject({
      status: 'success',
      duration: expect.any(Number),
    });
    expect(report?.summary.phases.remoteEntry).toMatchObject({
      status: 'success',
      duration: expect.any(Number),
      recovered: true,
    });
    expect(report?.summary.flags).toMatchObject({
      recovered: true,
    });

    observability.plugin.beforeLoadRemoteSnapshot?.({
      origin: enabledOrigin,
    } as any);
    observability.plugin.loadSnapshot?.({
      moduleInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
    } as any);
    observability.plugin.loadRemoteSnapshot?.({
      moduleInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      manifestUrl: 'http://localhost:3001/mf-manifest.json',
      remoteSnapshot: {
        version: 'http://localhost:3001/mf-manifest.json',
        remoteEntry: 'http://localhost:3001/remoteEntry.js',
      },
      from: 'manifest',
    } as any);
    observability.plugin.loadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js',
      },
      origin: enabledOrigin,
    } as any);
    observability.plugin.afterLoadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js',
      },
      origin: enabledOrigin,
    } as any);

    const cachedReport = observability.getLatestReport();

    expect(cachedReport?.summary.flags.cached).toBe(true);
    expect(cachedReport?.summary.phases.manifest.cached).toBe(true);
    expect(cachedReport?.summary.phases.remoteEntry.cached).toBe(true);
  });

  it('records shared dependency observability', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    observability.plugin.errorLoadShare?.({
      pkgName: 'react',
      shareInfo: {
        version: '18.3.1',
        from: 'remote',
        scope: ['default'],
        strategy: 'loaded-first',
        shareConfig: {
          requiredVersion: '^99.0.0',
          singleton: true,
          strictVersion: true,
          eager: false,
        },
      },
      shared: {},
      shareScopeMap: {
        default: {
          react: {
            '18.3.1': createShared({
              from: 'host?token=demo-secret',
            }),
          },
        },
      },
      lifecycle: 'loadShare',
      origin: enabledOrigin,
      error: new Error('token=demo-secret shared failed'),
      recovered: true,
    } as any);

    const report = observability.getLatestReport();
    const output = JSON.stringify(report);

    expect(report?.status).toBe('error');
    expect(report?.failedPhase).toBe('shared');
    expect(report?.shared).toMatchObject({
      name: 'react',
      shareScope: ['default'],
      requiredVersion: '^99.0.0',
      availableVersions: ['18.3.1'],
      reason: 'version-mismatch',
    });
    expect(output).toContain('demo-secret');
    expect(output).toContain('token=');
  });

  it('skips shared observability in compatibility mode for unsupported runtime versions and returns hook args', () => {
    const observability = createObservability(
      {
        level: 'verbose',
        console: false,
      },
      {
        guardSharedHooksByRuntimeVersion: true,
        returnHookArgs: true,
      },
    );
    const sharedArgs = {
      pkgName: 'react',
      shareInfo: createShared(),
      shared: {},
      origin: {
        version: '2.4.9',
        options: {
          name: 'host',
        },
      },
    };
    const previewArgs = {
      ...sharedArgs,
      origin: {
        version: '0.0.0-feat-federationdiagnosticerror-20260512025420',
        options: {
          name: 'host',
        },
      },
    };
    const afterArgs = {
      ...sharedArgs,
      selectedShared: createShared(),
    };
    const errorArgs = {
      ...sharedArgs,
      error: new Error('shared failed'),
    };

    expect(observability.plugin.beforeLoadShare?.(sharedArgs as any)).toBe(
      sharedArgs,
    );
    expect(observability.plugin.afterLoadShare?.(afterArgs as any)).toBe(
      afterArgs,
    );
    expect(observability.plugin.errorLoadShare?.(errorArgs as any)).toBe(
      errorArgs,
    );
    expect(observability.plugin.beforeLoadShare?.(previewArgs as any)).toBe(
      previewArgs,
    );
    expect(observability.getReports()).toHaveLength(0);
  });

  it('uses the applied instance version for shared compatibility checks', () => {
    const observability = createObservability(
      {
        level: 'verbose',
        console: false,
      },
      {
        guardSharedHooksByRuntimeVersion: true,
        returnHookArgs: true,
      },
    );
    observability.plugin.apply?.({
      version: '2.5.0',
    } as any);
    const sharedArgs = {
      pkgName: 'react',
      shareInfo: createShared(),
      shared: {},
      origin: {
        options: {
          name: 'host',
        },
      },
    };

    expect(observability.plugin.beforeLoadShare?.(sharedArgs as any)).toBe(
      sharedArgs,
    );

    const report = observability.getLatestReport();

    expect(report).toMatchObject({
      runtimeVersion: '2.5.0',
      summary: {
        phases: {
          shared: {
            status: 'start',
          },
        },
      },
    });
    expect(report?.events[0]).toMatchObject({
      phase: 'shared',
      runtimeVersion: '2.5.0',
    });
  });

  it('records shared observability by default without runtime version gating', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const sharedArgs = {
      pkgName: 'react',
      shareInfo: createShared(),
      shared: {},
      origin: {
        version: '2.4.9',
        options: {
          name: 'host',
        },
      },
    };

    observability.plugin.beforeLoadShare?.(sharedArgs as any);
    observability.plugin.afterLoadShare?.({
      ...sharedArgs,
      selectedShared: createShared(),
    } as any);

    expect(observability.getLatestReport()).toMatchObject({
      status: 'success',
      summary: {
        shared: {
          name: 'react',
        },
      },
    });
  });

  it('derives shared success details from loadShare hooks', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const shared = createShared();

    observability.plugin.beforeLoadShare?.({
      pkgName: 'react',
      shareInfo: shared,
      shared: {},
      origin: enabledOrigin,
    });
    observability.plugin.afterLoadShare?.({
      pkgName: 'react',
      shareInfo: shared,
      selectedShared: shared,
      shared: {},
      shareScopeMap: {
        default: {
          react: {
            '18.3.1': shared,
          },
        },
      },
      lifecycle: 'loadShare',
      origin: enabledOrigin,
    });

    const report = observability.getLatestReport();

    expect(report?.status).toBe('success');
    expect(report?.summary.outcome).toBe('shared-resolved');
    expect(report?.summary.sharedResolved).toBe(true);
    expect(report?.diagnosis?.title).toBe(
      'Shared dependency resolved successfully',
    );
    expect(report?.shared).toMatchObject({
      name: 'react',
      selectedVersion: '18.3.1',
      provider: 'host',
      availableVersions: ['18.3.1'],
    });
    expect(report?.summary.shared).toMatchObject({
      name: 'react',
      selectedVersion: '18.3.1',
      provider: 'host',
      shareScope: ['default'],
    });
  });

  it('records custom shared info misses as handled recovery', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const requestedShared = createShared({
      version: '99.0.0',
      from: 'remote',
      shareConfig: {
        requiredVersion: '^99.0.0',
        singleton: false,
        strictVersion: true,
        eager: false,
      },
    });
    const hostShared = createShared();

    observability.plugin.beforeLoadShare?.({
      pkgName: 'react',
      shareInfo: requestedShared,
      shared: {},
      origin: enabledOrigin,
    });
    observability.plugin.errorLoadShare?.({
      pkgName: 'react',
      shareInfo: requestedShared,
      shared: {},
      shareScopeMap: {
        default: {
          react: {
            '18.3.1': hostShared,
          },
        },
      },
      lifecycle: 'loadShare',
      origin: enabledOrigin,
      recovered: true,
    });

    const report = observability.getLatestReport();

    expect(report?.status).toBe('success');
    expect(report?.failedPhase).toBeUndefined();
    expect(report?.summary.outcome).toBe('recovered');
    expect(report?.summary.flags.recovered).toBe(true);
    expect(report?.summary.phases.shared).toMatchObject({
      status: 'complete',
      recovered: true,
    });
    expect(report?.shared).toMatchObject({
      name: 'react',
      requiredVersion: '^99.0.0',
      availableVersions: ['18.3.1'],
      reason: 'custom-share-info-unmatched',
    });
    expect(report?.events.at(-1)).toMatchObject({
      phase: 'shared',
      status: 'complete',
      message: 'shared:custom-share-info-unmatched',
      recovered: true,
    });
    expect(report?.summary.error).toBeUndefined();
  });

  it('derives eager boundary details from loadShareSync failures', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const asyncShared = createShared({
      version: '1.0.0',
      from: 'remote',
      shareConfig: {
        requiredVersion: '^1.0.0',
        singleton: false,
        strictVersion: false,
        eager: false,
      },
      get: () => Promise.resolve(() => ({ value: 'async' })),
    });

    observability.plugin.errorLoadShare?.({
      pkgName: 'observability-async-shared',
      shareInfo: asyncShared,
      shared: {},
      shareScopeMap: {},
      lifecycle: 'loadShareSync',
      origin: enabledOrigin,
      error: new Error('[ Federation Runtime ]: RUNTIME-005 shared failed'),
    });

    const report = observability.getLatestReport();

    expect(report?.status).toBe('error');
    expect(report?.shared).toMatchObject({
      name: 'observability-async-shared',
      requiredVersion: '^1.0.0',
      reason: 'sync-async-boundary',
    });
    expect(report?.diagnosis).toMatchObject({
      title: 'Shared dependency could not be resolved',
      ownerHint: 'shared',
      errorCode: 'RUNTIME-005',
      facts: expect.objectContaining({
        shareName: 'observability-async-shared',
        requiredVersion: '^1.0.0',
        eager: false,
        sharedReason: 'sync-async-boundary',
      }),
      actions: [
        expect.objectContaining({
          id: 'check-shared-provider',
          ownerHint: 'shared',
        }),
        expect.objectContaining({
          id: 'check-shared-version',
          ownerHint: 'shared',
        }),
        expect.objectContaining({
          id: 'check-eager-config',
          ownerHint: 'shared',
        }),
      ],
    });
    expect(report?.events.at(-1)?.message).toBe('shared:sync-async-boundary');
  });

  it('reports pure runtime shared failures with available shared versions', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });

    observability.plugin.errorLoadShare?.({
      pkgName: 'react',
      shareInfo: createShared({
        version: '18.0.0',
        shareConfig: {
          requiredVersion: '^18.0.0',
          singleton: true,
          strictVersion: true,
          eager: true,
        },
        get: undefined,
      }),
      shared: {},
      shareScopeMap: {
        default: {
          react: {
            '17.0.2': createShared({
              version: '17.0.2',
              from: 'host',
            }),
          },
        },
      },
      lifecycle: 'loadShareSync',
      origin: enabledOrigin,
      error: new Error('[ Federation Runtime ]: RUNTIME-006 shared failed'),
    });

    const report = observability.getLatestReport();

    expect(report?.diagnosis).toMatchObject({
      title: 'Shared dependency could not be resolved',
      ownerHint: 'shared',
      errorCode: 'RUNTIME-006',
      facts: expect.objectContaining({
        shareName: 'react',
        requiredVersion: '^18.0.0',
        availableVersions: '17.0.2',
        eager: true,
        sharedReason: 'version-mismatch',
      }),
      actions: [
        expect.objectContaining({
          id: 'check-shared-provider',
          ownerHint: 'shared',
        }),
        expect.objectContaining({
          id: 'check-shared-version',
          ownerHint: 'shared',
        }),
        expect.objectContaining({
          id: 'check-eager-config',
          ownerHint: 'shared',
        }),
      ],
    });
  });

  it('prints a minimal console hint with traceId on error', () => {
    const observability = createObservability({ level: 'verbose' });
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      emitManifestError(observability, {
        error: new Error(
          '[ Federation Runtime ]: Failed to get manifest. #RUNTIME-003',
        ),
      });

      emitManifestError(observability, {
        error: new Error('token=demo-secret failed again'),
      });

      expect(error).toHaveBeenCalledTimes(1);
      const output = String(error.mock.calls[0]?.[0]);
      expect(output).toContain(
        '[Module Federation] Observability report generated',
      );
      expect(output).toContain('traceId: mf-');
      expect(output).toContain('phase: manifest');
      expect(output).toContain('errorCode:');
      expect(output).toContain('read: enable browser output or use onReport');
      expect(output).toContain('demo-secret');
      expect(output).toContain('token=');
      expect(output).toContain('#hash');
      expect(output).not.toContain('rawStack:');
      expect(output).not.toContain('/Users/bytedance/private');
    } finally {
      error.mockRestore();
    }
  });

  it('prints only traceId and errorCode for browser production console hints', () => {
    const observability = createObservability({
      level: 'verbose',
      browser: {
        enabled: true,
        mode: 'production',
        scope: 'runtime_host',
      },
    });
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      emitManifestError(observability, {
        error: new Error(
          '[ Federation Runtime ]: Failed to get manifest. #RUNTIME-003',
        ),
      });

      expect(error).toHaveBeenCalledTimes(1);
      const output = String(error.mock.calls[0]?.[0]);
      expect(output).toContain(
        '[Module Federation] Observability report generated',
      );
      expect(output).toContain('traceId: mf-');
      expect(output).toContain('errorCode: RUNTIME-003');
      expect(output).not.toContain('phase:');
      expect(output).not.toContain('requestId:');
      expect(output).not.toContain('read:');
      expect(output).not.toContain('rawStack:');
      expect(output).not.toContain('demo-secret');
      expect(output).not.toContain('mf-manifest.json');
    } finally {
      error.mockRestore();
    }
  });

  it('prints start console hints by default in development mode', () => {
    const originalFederation = (
      globalThis as {
        __FEDERATION__?: Record<string, unknown>;
      }
    ).__FEDERATION__;
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    try {
      (
        globalThis as {
          __FEDERATION__?: Record<string, unknown>;
        }
      ).__FEDERATION__ = {};
      const observability = createObservability({
        browser: {
          enabled: true,
          scope: 'runtime_host',
        },
      });

      emitRemoteStart(observability);
      observability.plugin.beforeLoadShare?.({
        pkgName: 'react',
        shareInfo: createShared(),
        shared: {},
        origin: enabledOrigin,
      });

      expect(info).toHaveBeenCalledTimes(2);
      const remoteOutput = String(info.mock.calls[0]?.[0]);
      const sharedOutput = String(info.mock.calls[1]?.[0]);

      expect(remoteOutput).toContain(
        '[Module Federation] Observability trace started',
      );
      expect(remoteOutput).toContain('traceId: mf-');
      expect(remoteOutput).toContain('phase: loadRemote');
      expect(remoteOutput).toContain('requestId: remote/Button');
      expect(remoteOutput).toContain(
        'read: window.__FEDERATION__.__OBSERVABILITY__["runtime_host"].getReport',
      );

      expect(sharedOutput).toContain('phase: shared');
      expect(sharedOutput).toContain('requestId: shared:react');
      expect(sharedOutput).toContain('shared: react');
      expect(sharedOutput).toContain('lifecycle: loadShare');

      const reports = observability.getReports({ limit: 10 });
      expect(reports).toHaveLength(2);
      expect(reports.map((report) => report.status)).toEqual([
        'pending',
        'pending',
      ]);
    } finally {
      (
        globalThis as {
          __FEDERATION__?: Record<string, unknown>;
        }
      ).__FEDERATION__ = originalFederation;
      info.mockRestore();
    }
  });

  it('requires explicit start console hints in production mode', () => {
    const originalFederation = (
      globalThis as {
        __FEDERATION__?: Record<string, unknown>;
      }
    ).__FEDERATION__;
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    try {
      (
        globalThis as {
          __FEDERATION__?: Record<string, unknown>;
        }
      ).__FEDERATION__ = {};

      const productionDefault = createObservability({
        browser: {
          enabled: true,
          scope: 'runtime_host',
          mode: 'production',
        },
      });

      emitRemoteStart(productionDefault);
      productionDefault.plugin.beforeLoadShare?.({
        pkgName: 'react',
        shareInfo: createShared(),
        shared: {},
        origin: enabledOrigin,
      });

      expect(info).not.toHaveBeenCalled();
      expect(productionDefault.getReports({ limit: 10 })).toHaveLength(0);

      const productionExplicit = createObservability({
        browser: {
          enabled: true,
          scope: 'runtime_host',
          mode: 'production',
        },
        trace: {
          printStart: true,
        },
      });

      emitRemoteStart(productionExplicit);
      productionExplicit.plugin.beforeLoadShare?.({
        pkgName: 'react',
        shareInfo: createShared(),
        shared: {},
        origin: enabledOrigin,
      });

      expect(info).toHaveBeenCalledTimes(2);
      expect(productionExplicit.getReports({ limit: 10 })).toHaveLength(2);
    } finally {
      (
        globalThis as {
          __FEDERATION__?: Record<string, unknown>;
        }
      ).__FEDERATION__ = originalFederation;
      info.mockRestore();
    }
  });

  it('stores the original error stack by default', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
    });
    const error = new Error('token=demo-secret manifest failed');
    error.stack = [
      'Error: token=demo-secret manifest failed',
      '    at load (/Users/bytedance/private/app.ts:1:2)',
      '    at fetch (http://localhost:3001/mf-manifest.json?token=demo-secret#hash:1:2)',
      '    at extra (/tmp/secret.ts:1:1)',
      '    at more (/private/var/tmp/more.ts:1:1)',
      '    at ignored (/home/demo/ignored.ts:1:1)',
    ].join('\n');

    emitManifestError(observability, { error });

    const report = observability.getLatestReport();
    const stack = report?.errorStack || '';

    expect(stack).toContain('Error: token=demo-secret manifest failed');
    expect(stack).toContain('/Users/bytedance/private/app.ts');
    expect(stack).toContain(
      'http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
    );
    expect(stack.split('\n')).toHaveLength(6);
    expect(stack).toContain('demo-secret');
    expect(stack).toContain('token=');
    expect(stack).toContain('#hash');
  });

  it('prints the raw stack only when explicitly allowed', () => {
    const observability = createObservability({
      level: 'verbose',
      printRawStack: true,
    });
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const error = new Error('raw stack enabled');
    error.stack = [
      'Error: raw stack enabled',
      '    at raw (/Users/bytedance/raw.ts:1:1)',
    ].join('\n');

    try {
      emitManifestError(observability, { error });

      const output = String(errorSpy.mock.calls[0]?.[0]);
      expect(output).toContain('rawStack:');
      expect(output).toContain('/Users/bytedance/raw.ts');
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('passes raw errors to explicit callbacks without affecting loading', () => {
    const rawError = new Error('raw callback');
    const onRawError = vi.fn(() => {
      throw new Error('ignored callback failure');
    });
    const observability = createObservability({
      level: 'verbose',
      console: false,
      onRawError,
    });

    expect(() =>
      emitManifestError(observability, { error: rawError }),
    ).not.toThrow();

    expect(onRawError).toHaveBeenCalledTimes(1);
    expect(onRawError).toHaveBeenCalledWith(
      rawError,
      expect.objectContaining({
        origin: enabledOrigin,
        event: expect.objectContaining({
          errorMessage: 'raw callback',
          errorStack: expect.any(String),
        }),
        report: expect.objectContaining({
          status: 'error',
          errorStack: expect.any(String),
        }),
      }),
    );
    expect(observability.getLatestReport()?.status).toBe('error');
  });

  it('exposes a browser reader only when plugin options allow it', async () => {
    const originalFederation = (
      globalThis as {
        __FEDERATION__?: {
          __OBSERVABILITY__?: Record<string, unknown>;
        };
      }
    ).__FEDERATION__;

    try {
      (
        globalThis as {
          __FEDERATION__?: {
            __OBSERVABILITY__?: Record<string, unknown>;
          };
        }
      ).__FEDERATION__ = {};

      const observability = createObservability({
        level: 'verbose',
        browser: {
          enabled: true,
          scope: 'host',
        },
      });

      await emitRemoteLoaded(observability, {
        origin: {
          options: {
            name: 'host',
          },
        },
      });

      const reader = (
        globalThis as {
          __FEDERATION__?: {
            __OBSERVABILITY__?: Record<
              string,
              {
                getLatestReport(): { traceId: string; events: unknown[] };
                getReport(traceId: string): { events: unknown[] } | undefined;
                getReports(options?: {
                  limit?: number;
                }): { events: unknown[] }[];
                findReports(query?: {
                  remote?: string;
                }): { events: unknown[] }[];
                exportReport(
                  traceId?: string,
                ): { events: unknown[] } | undefined;
                getTraceIds(): string[];
                clear?: unknown;
              }
            >;
          };
        }
      ).__FEDERATION__?.__OBSERVABILITY__?.host;

      expect(reader).toBeDefined();
      expect(reader?.clear).toBeUndefined();
      expect(reader?.getTraceIds()).toHaveLength(1);

      const latestReport = reader?.getLatestReport();
      expect(latestReport?.traceId).toBeDefined();
      latestReport?.events.pop();

      expect(reader?.getLatestReport().events).toHaveLength(1);
      expect(
        reader?.getReport(latestReport?.traceId || '')?.events,
      ).toHaveLength(1);
      expect(reader?.getReports({ limit: 1 })).toHaveLength(1);
      expect(reader?.findReports({ remote: 'remote' })).toHaveLength(1);
      expect(
        reader?.exportReport(latestReport?.traceId || '')?.events,
      ).toHaveLength(1);
    } finally {
      if (originalFederation) {
        (
          globalThis as {
            __FEDERATION__?: {
              __OBSERVABILITY__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__ = originalFederation;
      } else {
        delete (
          globalThis as {
            __FEDERATION__?: {
              __OBSERVABILITY__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__;
      }
    }
  });

  it('does not expose the browser reader by default', async () => {
    const originalFederation = (
      globalThis as {
        __FEDERATION__?: {
          __OBSERVABILITY__?: Record<string, unknown>;
        };
      }
    ).__FEDERATION__;

    try {
      (
        globalThis as {
          __FEDERATION__?: {
            __OBSERVABILITY__?: Record<string, unknown>;
          };
        }
      ).__FEDERATION__ = {};

      const observability = createObservability({ level: 'verbose' });

      await emitRemoteLoaded(observability);

      expect(
        (
          globalThis as {
            __FEDERATION__?: {
              __OBSERVABILITY__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__?.__OBSERVABILITY__,
      ).toBeUndefined();
    } finally {
      if (originalFederation) {
        (
          globalThis as {
            __FEDERATION__?: {
              __OBSERVABILITY__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__ = originalFederation;
      } else {
        delete (
          globalThis as {
            __FEDERATION__?: {
              __OBSERVABILITY__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__;
      }
    }
  });

  it('does not write Node observability files by default', async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-observability-'),
    );
    const latestFile = path.join(directory, 'latest.json');
    const eventsFile = path.join(directory, 'events.jsonl');
    const observability = ObservabilityNode({
      level: 'verbose',
      console: false,
      directory,
    });

    try {
      emitManifestError(observability);
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(fs.existsSync(latestFile)).toBe(false);
      expect(fs.existsSync(eventsFile)).toBe(false);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('prints raw stacks from the Node entry only when explicitly allowed', () => {
    const observability = ObservabilityNode({
      level: 'verbose',
      printRawStack: true,
    });
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const error = new Error('node raw stack enabled');
    error.stack = [
      'Error: node raw stack enabled',
      '    at raw (/Users/bytedance/node-raw.ts:1:1)',
    ].join('\n');

    try {
      emitManifestError(observability, { error });

      const output = String(errorSpy.mock.calls[0]?.[0]);
      expect(output).toContain('rawStack:');
      expect(output).toContain('/Users/bytedance/node-raw.ts');
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('writes Node observability files only when plugin options allow it', async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-observability-'),
    );
    const latestFile = path.join(directory, 'latest.json');
    const eventsFile = path.join(directory, 'events.jsonl');
    const originalNonWebpackRequire = (
      globalThis as {
        __non_webpack_require__?: (id: string) => unknown;
      }
    ).__non_webpack_require__;

    try {
      (
        globalThis as {
          __non_webpack_require__?: (id: string) => unknown;
        }
      ).__non_webpack_require__ = (id: string) => {
        if (id === 'node:fs' || id === 'fs') {
          return fs;
        }

        if (id === 'node:path' || id === 'path') {
          return path;
        }

        throw new Error(`Unsupported module: ${id}`);
      };

      const observability = ObservabilityNode({
        level: 'verbose',
        console: false,
        fileOutput: true,
        directory,
      });

      emitManifestError(observability, {
        origin: {
          options: {
            name: 'host',
          },
        },
        error: new Error('token=demo-secret manifest failed'),
      });

      await waitForFile(latestFile);
      await waitForFile(eventsFile);

      const latest = fs.readFileSync(latestFile, 'utf8');
      const eventsOutput = fs.readFileSync(eventsFile, 'utf8');

      expect(latest).toContain('"status": "error"');
      expect(eventsOutput).toContain('"phase":"manifest"');
      expect(`${latest}\n${eventsOutput}`).toContain('demo-secret');
      expect(`${latest}\n${eventsOutput}`).toContain('token=');
      expect(`${latest}\n${eventsOutput}`).toContain('#hash');
    } finally {
      if (originalNonWebpackRequire) {
        (
          globalThis as {
            __non_webpack_require__?: (id: string) => unknown;
          }
        ).__non_webpack_require__ = originalNonWebpackRequire;
      } else {
        delete (
          globalThis as {
            __non_webpack_require__?: (id: string) => unknown;
          }
        ).__non_webpack_require__;
      }
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('lets business code mark component loaded after runtime observability starts', async () => {
    const observability = createObservability({ level: 'verbose' });

    await emitRemoteLoaded(observability);

    const componentEvent = observability.markComponentLoaded({
      requestId: 'remote/Button',
      componentName: 'RemoteButton',
      metadata: {
        route: '/account?token=demo-secret',
        renderMs: 12,
        ready: true,
        token: 'demo-secret',
      },
    });
    const report = observability.getLatestReport();

    expect(componentEvent?.phase).toBe('component');
    expect(componentEvent?.eventName).toBe('component:business-loaded');
    expect(componentEvent?.source).toBe('business');
    expect(componentEvent?.componentName).toBe('RemoteButton');
    expect(componentEvent?.metadata).toMatchObject({
      route: '/account?token=demo-secret',
      renderMs: 12,
      ready: true,
      token: 'demo-secret',
    });
    expect(report?.summary.componentLoaded).toBe(true);
    expect(report?.summary.outcome).toBe('component-loaded');
    expect(report?.diagnosis).toMatchObject({
      title: 'Business component loaded',
      status: 'success',
      outcome: 'component-loaded',
      facts: expect.objectContaining({
        componentName: 'RemoteButton',
        componentLoaded: true,
      }),
    });
    expect(JSON.stringify(report)).toContain('component:business-loaded');
    expect(JSON.stringify(report)).toContain('demo-secret');
    expect(JSON.stringify(report)).toContain('token=');
  });

  it('does not let observability callbacks affect loading', async () => {
    const observability = createObservability({
      level: 'verbose',
      onEvent: vi.fn(() => {
        throw new Error('onEvent failed');
      }),
      onReport: vi.fn(() => {
        throw new Error('onReport failed');
      }),
    });

    await expect(emitRemoteLoaded(observability)).resolves.toBeUndefined();

    expect(observability.getLatestReport()?.status).toBe('success');
  });

  it('does not let observability callbacks affect error collection', () => {
    const observability = createObservability({
      level: 'verbose',
      console: false,
      onEvent: vi.fn(() => {
        throw new Error('onEvent failed');
      }),
      onReport: vi.fn(() => {
        throw new Error('onReport failed');
      }),
      onRawError: vi.fn(() => {
        throw new Error('onRawError failed');
      }),
    });

    expect(() =>
      emitRemoteError(observability, {
        error: new Error(
          '[ Federation Runtime ]: Failed to load script resources. #RUNTIME-008',
        ),
      }),
    ).not.toThrow();

    expect(observability.getLatestReport()).toMatchObject({
      status: 'error',
      errorCode: 'RUNTIME-008',
    });
  });
});
