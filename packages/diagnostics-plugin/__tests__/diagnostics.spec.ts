import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { DiagnosticsPlugin } from '../src';
import { DiagnosticsPlugin as DiagnosticsNode } from '../src/node';

const enabledOrigin = {
  options: {
    name: 'host',
    security: {
      diagnostics: {
        enabled: true,
        maxEvents: 10,
      },
    },
  },
};

const disabledOrigin = {
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

const emitRemoteLoaded = (
  diagnostics: ReturnType<typeof DiagnosticsPlugin>,
  overrides: Record<string, unknown> = {},
) =>
  diagnostics.plugin.onLoad?.({
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
  diagnostics: ReturnType<typeof DiagnosticsPlugin>,
  overrides: Record<string, unknown> = {},
) =>
  diagnostics.plugin.beforeRequest?.({
    id: 'remote/Button',
    options: {},
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitRemoteComplete = (
  diagnostics: ReturnType<typeof DiagnosticsPlugin>,
  overrides: Record<string, unknown> = {},
) =>
  diagnostics.plugin.afterLoadRemote?.({
    id: 'remote/Button',
    expose: './Button',
    remote: {
      name: 'remote',
      entry: 'http://localhost:3001/mf-manifest.json',
    },
    origin: enabledOrigin,
    ...overrides,
  } as any);

const emitRemoteError = (
  diagnostics: ReturnType<typeof DiagnosticsPlugin>,
  overrides: Record<string, unknown> = {},
) =>
  diagnostics.plugin.errorLoadRemote?.({
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
  diagnostics: ReturnType<typeof DiagnosticsPlugin>,
  overrides: Record<string, unknown> = {},
) =>
  diagnostics.plugin.errorLoadRemote?.({
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

describe('DiagnosticsPlugin', () => {
  it('does not record events unless security diagnostics is enabled', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose' });

    emitRemoteLoaded(diagnostics, {
      origin: disabledOrigin,
    });

    expect(diagnostics.getEvents()).toHaveLength(0);
    expect(diagnostics.getLatestReport()).toBeUndefined();
  });

  it('records a successful loadRemote report when enabled', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose' });

    emitRemoteStart(diagnostics);
    emitRemoteLoaded(diagnostics);

    const report = diagnostics.getLatestReport();
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
    expect(report?.events).toHaveLength(2);
  });

  it('records a complete loadRemote event as the final runtime outcome', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose' });

    emitRemoteStart(diagnostics);
    emitRemoteLoaded(diagnostics);
    emitRemoteComplete(diagnostics);

    const report = diagnostics.getLatestReport();
    expect(report?.status).toBe('success');
    expect(report?.summary).toMatchObject({
      runtimeLoaded: true,
      loadCompleted: true,
      componentLoaded: false,
      outcome: 'runtime-loaded',
      lastPhase: 'loadRemote',
    });
  });

  it('records manifest and remoteEntry lifecycle hooks without diagnostic events', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose', console: false });

    diagnostics.plugin.beforeLoadRemoteSnapshot?.({
      moduleInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      origin: enabledOrigin,
    } as any);
    diagnostics.plugin.afterResolve?.({
      id: 'remote/Button',
      expose: './Button',
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
      origin: enabledOrigin,
    } as any);
    diagnostics.plugin.loadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js',
      },
      origin: enabledOrigin,
    } as any);
    diagnostics.plugin.afterLoadEntry?.({
      remoteInfo: {
        name: 'remote',
        entry: 'http://localhost:3001/remoteEntry.js',
      },
      origin: enabledOrigin,
    } as any);

    expect(diagnostics.getEvents()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'manifest',
          status: 'start',
          lifecycle: 'beforeLoadRemoteSnapshot',
        }),
        expect.objectContaining({
          phase: 'manifest',
          status: 'success',
          lifecycle: 'afterResolve',
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

  it('treats a recovered complete event as a recovered runtime outcome', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose', console: false });

    emitRemoteStart(diagnostics);
    expect(emitRemoteError(diagnostics)).toBeUndefined();
    emitRemoteComplete(diagnostics, {
      error: new Error('remote load failed'),
      recovered: true,
    });

    const report = diagnostics.getLatestReport();
    expect(report?.summary).toMatchObject({
      recovered: true,
      runtimeLoaded: true,
      loadCompleted: true,
      outcome: 'recovered',
    });
  });

  it('sanitizes urls and sensitive message fields', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose', console: false });

    emitManifestError(diagnostics, {
      error: new Error(
        'authorization=demo-secret failed at http://localhost:3001/mf-manifest.json?token=demo-secret#hash',
      ),
    });

    const output = JSON.stringify(diagnostics.getLatestReport());
    expect(output).toContain('http://localhost:3001/mf-manifest.json');
    expect(output).not.toContain('demo-secret');
    expect(output).not.toContain('token=');
    expect(output).not.toContain('#hash');
  });

  it('keeps the first specific failed phase when loadRemote closes the trace', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose', console: false });

    emitRemoteStart(diagnostics, {
      remote: {
        name: 'remote',
      },
    });
    emitManifestError(diagnostics, {
      id: 'remote/Button',
      remote: {
        name: 'remote',
      },
      error: new Error('manifest failed'),
    });
    expect(emitRemoteError(diagnostics)).toBeUndefined();
    emitRemoteComplete(diagnostics, {
      remote: {
        name: 'remote',
      },
      error: new Error('outer loadRemote failed'),
    });

    const report = diagnostics.getLatestReport();
    expect(report?.status).toBe('error');
    expect(report?.failedPhase).toBe('manifest');
    expect(report?.summary).toMatchObject({
      loadCompleted: true,
      runtimeLoaded: false,
      componentLoaded: false,
      outcome: 'failed',
    });
  });

  it('records sanitized shared dependency diagnostics', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose', console: false });

    diagnostics.plugin.errorLoadShare?.({
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

    const report = diagnostics.getLatestReport();
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
    expect(output).not.toContain('demo-secret');
    expect(output).not.toContain('token=');
  });

  it('derives shared success details from loadShare hooks', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose', console: false });
    const shared = createShared();

    diagnostics.plugin.beforeLoadShare?.({
      pkgName: 'react',
      shareInfo: shared,
      shared: {},
      origin: enabledOrigin,
    });
    diagnostics.plugin.afterLoadShare?.({
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

    const report = diagnostics.getLatestReport();

    expect(report?.status).toBe('success');
    expect(report?.shared).toMatchObject({
      name: 'react',
      selectedVersion: '18.3.1',
      provider: 'host',
      availableVersions: ['18.3.1'],
    });
  });

  it('derives shared version mismatch details from errorLoadShare', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose', console: false });
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

    diagnostics.plugin.beforeLoadShare?.({
      pkgName: 'react',
      shareInfo: requestedShared,
      shared: {},
      origin: enabledOrigin,
    });
    diagnostics.plugin.errorLoadShare?.({
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

    const report = diagnostics.getLatestReport();

    expect(report?.status).toBe('error');
    expect(report?.failedPhase).toBe('shared');
    expect(report?.shared).toMatchObject({
      name: 'react',
      requiredVersion: '^99.0.0',
      availableVersions: ['18.3.1'],
      reason: 'version-mismatch',
    });
  });

  it('derives eager boundary details from loadShareSync failures', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose', console: false });
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

    diagnostics.plugin.errorLoadShare?.({
      pkgName: 'diagnostics-async-shared',
      shareInfo: asyncShared,
      shared: {},
      shareScopeMap: {},
      lifecycle: 'loadShareSync',
      origin: enabledOrigin,
      error: new Error('[ Federation Runtime ]: RUNTIME-005 shared failed'),
    });

    const report = diagnostics.getLatestReport();

    expect(report?.status).toBe('error');
    expect(report?.shared).toMatchObject({
      name: 'diagnostics-async-shared',
      requiredVersion: '^1.0.0',
      reason: 'sync-async-boundary',
    });
    expect(report?.events.at(-1)?.message).toBe('shared:sync-async-boundary');
  });

  it('prints a minimal console hint with traceId on error', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose' });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      emitManifestError(diagnostics);

      emitManifestError(diagnostics, {
        error: new Error('token=demo-secret failed again'),
      });

      expect(warn).toHaveBeenCalledTimes(1);
      const output = String(warn.mock.calls[0]?.[0]);
      expect(output).toContain(
        '[Module Federation] Diagnostic report generated',
      );
      expect(output).toContain('traceId: mf-');
      expect(output).toContain('phase: manifest');
      expect(output).toContain('read: diagnostics.getReport');
      expect(output).not.toContain('demo-secret');
      expect(output).not.toContain('token=');
      expect(output).not.toContain('#hash');
    } finally {
      warn.mockRestore();
    }
  });

  it('exposes a browser reader only when plugin and security both allow it', () => {
    const originalFederation = (
      globalThis as {
        __FEDERATION__?: {
          __DIAGNOSTICS__?: Record<string, unknown>;
        };
      }
    ).__FEDERATION__;

    try {
      (
        globalThis as {
          __FEDERATION__?: {
            __DIAGNOSTICS__?: Record<string, unknown>;
          };
        }
      ).__FEDERATION__ = {};

      const diagnostics = DiagnosticsPlugin({
        level: 'verbose',
        browser: {
          enabled: true,
          scope: 'host',
        },
      });

      emitRemoteLoaded(diagnostics, {
        origin: {
          options: {
            name: 'host',
            security: {
              diagnostics: {
                enabled: true,
                maxEvents: 10,
                browserGlobal: true,
              },
            },
          },
        },
      });

      const reader = (
        globalThis as {
          __FEDERATION__?: {
            __DIAGNOSTICS__?: Record<
              string,
              {
                getLatestReport(): { traceId: string; events: unknown[] };
                getReport(traceId: string): { events: unknown[] } | undefined;
                getTraceIds(): string[];
                clear?: unknown;
              }
            >;
          };
        }
      ).__FEDERATION__?.__DIAGNOSTICS__?.host;

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
    } finally {
      if (originalFederation) {
        (
          globalThis as {
            __FEDERATION__?: {
              __DIAGNOSTICS__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__ = originalFederation;
      } else {
        delete (
          globalThis as {
            __FEDERATION__?: {
              __DIAGNOSTICS__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__;
      }
    }
  });

  it('does not expose the browser reader when security blocks it', () => {
    const originalFederation = (
      globalThis as {
        __FEDERATION__?: {
          __DIAGNOSTICS__?: Record<string, unknown>;
        };
      }
    ).__FEDERATION__;

    try {
      (
        globalThis as {
          __FEDERATION__?: {
            __DIAGNOSTICS__?: Record<string, unknown>;
          };
        }
      ).__FEDERATION__ = {};

      const diagnostics = DiagnosticsPlugin({
        level: 'verbose',
        browser: {
          enabled: true,
          scope: 'host',
        },
      });

      emitRemoteLoaded(diagnostics);

      expect(
        (
          globalThis as {
            __FEDERATION__?: {
              __DIAGNOSTICS__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__?.__DIAGNOSTICS__,
      ).toBeUndefined();
    } finally {
      if (originalFederation) {
        (
          globalThis as {
            __FEDERATION__?: {
              __DIAGNOSTICS__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__ = originalFederation;
      } else {
        delete (
          globalThis as {
            __FEDERATION__?: {
              __DIAGNOSTICS__?: Record<string, unknown>;
            };
          }
        ).__FEDERATION__;
      }
    }
  });

  it('writes sanitized Node diagnostics files only when security allows it', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-diagnostics-'));
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

      const diagnostics = DiagnosticsNode({
        level: 'verbose',
        console: false,
        directory,
      });

      emitManifestError(diagnostics, {
        origin: {
          options: {
            name: 'host',
            security: {
              diagnostics: {
                enabled: true,
                maxEvents: 10,
                fileOutput: true,
              },
            },
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
      expect(`${latest}\n${eventsOutput}`).not.toContain('demo-secret');
      expect(`${latest}\n${eventsOutput}`).not.toContain('token=');
      expect(`${latest}\n${eventsOutput}`).not.toContain('#hash');
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

  it('lets business code mark component loaded after runtime diagnostics starts', () => {
    const diagnostics = DiagnosticsPlugin({ level: 'verbose' });

    emitRemoteLoaded(diagnostics);

    const componentEvent = diagnostics.markComponentLoaded({
      requestId: 'remote/Button',
      componentName: 'RemoteButton',
    });
    const report = diagnostics.getLatestReport();

    expect(componentEvent?.phase).toBe('component');
    expect(componentEvent?.eventName).toBe('component:business-loaded');
    expect(componentEvent?.source).toBe('business');
    expect(componentEvent?.componentName).toBe('RemoteButton');
    expect(report?.summary.componentLoaded).toBe(true);
    expect(report?.summary.outcome).toBe('component-loaded');
    expect(JSON.stringify(report)).toContain('component:business-loaded');
  });

  it('does not let diagnostics callbacks affect loading', () => {
    const diagnostics = DiagnosticsPlugin({
      level: 'verbose',
      onEvent: vi.fn(() => {
        throw new Error('onEvent failed');
      }),
      onReport: vi.fn(() => {
        throw new Error('onReport failed');
      }),
    });

    expect(() => emitRemoteLoaded(diagnostics)).not.toThrow();

    expect(diagnostics.getLatestReport()?.status).toBe('success');
  });
});
