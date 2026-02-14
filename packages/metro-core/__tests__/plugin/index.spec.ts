import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withModuleFederation } from '../../src/plugin';

function createProjectRoot() {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'metro-core-'));
  fs.mkdirSync(path.join(projectRoot, 'node_modules'), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, 'index.js'), 'console.log("hello");');
  fs.writeFileSync(path.join(projectRoot, 'babel-transformer.js'), '');
  fs.writeFileSync(
    path.join(projectRoot, 'package.json'),
    JSON.stringify({
      dependencies: {
        react: '19.1.0',
        'react-native': '0.80.0',
      },
    }),
  );
  return projectRoot;
}

function getValidConfig() {
  return {
    name: 'MetroHost',
    remotes: {},
    shared: {
      react: {
        singleton: true,
        eager: true,
        version: '19.1.0',
        requiredVersion: '19.1.0',
      },
      'react-native': {
        singleton: true,
        eager: true,
        version: '0.80.0',
        requiredVersion: '0.80.0',
      },
    },
  };
}

function createMetroConfig(projectRoot: string) {
  return {
    projectRoot,
    serializer: {
      getModulesRunBeforeMainModule: vi.fn(() => []),
      getPolyfills: vi.fn(() => []),
    },
    transformer: {
      babelTransformerPath: path.join(projectRoot, 'babel-transformer.js'),
    },
    resolver: {},
    server: {},
  } as any;
}

describe('withModuleFederation', () => {
  const originalArgv = process.argv.slice();

  beforeEach(() => {
    process.argv[2] = 'start';
  });

  afterEach(() => {
    process.argv = originalArgv.slice();
    delete (global as any).__METRO_FEDERATION_CONFIG;
    delete (global as any).__METRO_FEDERATION_HOST_ENTRY_PATH;
    delete (global as any).__METRO_FEDERATION_REMOTE_ENTRY_PATH;
    delete (global as any).__METRO_FEDERATION_MANIFEST_PATH;
    vi.restoreAllMocks();
  });

  it('uses runtimePlugins in normalized federation config', () => {
    const projectRoot = createProjectRoot();
    const metroConfig = createMetroConfig(projectRoot);
    const runtimePluginPath = path.join(projectRoot, 'runtime-plugin.js');
    fs.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');

    withModuleFederation(metroConfig, {
      ...getValidConfig(),
      runtimePlugins: [runtimePluginPath],
    } as any);

    const normalized = (global as any).__METRO_FEDERATION_CONFIG;
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf');
    expect(normalized.plugins).toContain(
      path.relative(tmpDirPath, runtimePluginPath),
    );
  });

  it('warns when deprecated plugins is used', () => {
    const projectRoot = createProjectRoot();
    const metroConfig = createMetroConfig(projectRoot);
    const runtimePluginPath = path.join(projectRoot, 'runtime-plugin.js');
    fs.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    withModuleFederation(metroConfig, {
      ...getValidConfig(),
      plugins: [runtimePluginPath],
    } as any);

    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls.join('\n')).toContain('deprecated');
  });
});
