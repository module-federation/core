import path from 'node:path';
import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => {
  const memfs = require('memfs').fs;
  return { ...memfs, default: memfs };
});

vi.mock('../../src/plugin/babel-transformer', () => ({
  createBabelTransformer: vi.fn(
    ({ tmpDirPath }: { tmpDirPath: string }) =>
      `${tmpDirPath}/babel-transformer.js`,
  ),
}));

vi.mock('../../src/utils/federated-remote-types', () => ({
  maybeGenerateFederatedRemoteTypes: vi.fn(async () => undefined),
  applyTypesMetaToManifest: vi.fn(
    (manifest: Record<string, any>, typesMeta) => {
      if (!typesMeta?.zipName && !typesMeta?.apiFileName) {
        return manifest;
      }
      manifest.metaData = manifest.metaData || {};
      manifest.metaData.types = manifest.metaData.types || {};
      if (typesMeta.zipName) {
        manifest.metaData.types.zip = typesMeta.zipName;
      }
      if (typesMeta.apiFileName) {
        manifest.metaData.types.api = typesMeta.apiFileName;
      }
      return manifest;
    },
  ),
}));

import { withModuleFederation } from '../../src/plugin';
import * as federatedTypes from '../../src/utils/federated-remote-types';

let projectCount = 0;

function createProjectRoot() {
  projectCount += 1;
  const projectRoot = `/virtual/metro-core-${projectCount}`;
  vol.fromJSON({
    [path.join(projectRoot, 'index.js')]: 'console.log("hello");',
    [path.join(projectRoot, 'babel-transformer.js')]: '',
    [path.join(projectRoot, 'package.json')]: JSON.stringify({
      dependencies: {
        react: '19.1.0',
        'react-native': '0.80.0',
      },
    }),
  });
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
    delete (global as any).__METRO_FEDERATION_DTS_ASSETS;
    vol.reset();
    vi.restoreAllMocks();
  });

  it('uses runtimePlugins in normalized federation config', () => {
    const projectRoot = createProjectRoot();
    const metroConfig = createMetroConfig(projectRoot);
    const runtimePluginPath = path.join(projectRoot, 'runtime-plugin.js');
    vol.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');

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
    vol.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    withModuleFederation(metroConfig, {
      ...getValidConfig(),
      plugins: [runtimePluginPath],
    } as any);

    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls.join('\n')).toContain('deprecated');
  });

  it('warns only once when runtime plugin params are provided', () => {
    const projectRoot = createProjectRoot();
    const metroConfig = createMetroConfig(projectRoot);
    const runtimePluginPath = path.join(projectRoot, 'runtime-plugin.js');
    vol.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    withModuleFederation(metroConfig, {
      ...getValidConfig(),
      runtimePlugins: [[runtimePluginPath, { answer: 42 }]],
    } as any);

    const warnings = warnSpy.mock.calls
      .flat()
      .filter((entry) => String(entry).includes('runtimePlugins[0][1]'));

    expect(warnings).toHaveLength(1);
  });

  it('generates dts assets for remote in start mode and rewrites dev URLs', async () => {
    const projectRoot = createProjectRoot();
    const metroConfig = createMetroConfig(projectRoot);
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf-metro');
    const generateTypesSpy = vi.mocked(
      federatedTypes.maybeGenerateFederatedRemoteTypes,
    );
    generateTypesSpy.mockResolvedValueOnce({
      zipName: '@mf-types.zip',
      apiFileName: '@mf-types.d.ts',
    });

    const updatedConfig = withModuleFederation(metroConfig, {
      ...getValidConfig(),
      exposes: {
        './button': './src/button.ts',
      },
      dts: true,
    } as any);

    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(generateTypesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        projectRoot,
        outputDir: tmpDirPath,
      }),
    );
    expect((global as any).__METRO_FEDERATION_DTS_ASSETS).toEqual({
      zipName: '@mf-types.zip',
      apiFileName: '@mf-types.d.ts',
    });

    const rewrittenZip =
      updatedConfig.server.rewriteRequestUrl('/@mf-types.zip');
    const rewrittenApi =
      updatedConfig.server.rewriteRequestUrl('/@mf-types.d.ts');
    expect(rewrittenZip).toContain('/node_modules/.mf-metro/@mf-types.zip');
    expect(rewrittenApi).toContain('/node_modules/.mf-metro/@mf-types.d.ts');

    const manifestPath = (global as any).__METRO_FEDERATION_MANIFEST_PATH;
    const manifest = JSON.parse(vol.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.metaData.types.zip).toBe('@mf-types.zip');
    expect(manifest.metaData.types.api).toBe('@mf-types.d.ts');
  });
});
