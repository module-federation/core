import path from 'node:path';
import type { CustomResolutionContext, CustomResolver } from 'metro-resolver';
import { describe, expect, it, vi } from 'vitest';
import { createResolveRequest } from '../../src/plugin/resolver';
import type { ModuleFederationConfigNormalized } from '../../src/types';
import type { VirtualModuleManager } from '../../src/utils';

type SharedResolutionCase = {
  sharedName: string;
  importName: string;
  expectedFileName: string;
};

function createConfig(
  sharedName: string,
  importName: string,
): ModuleFederationConfigNormalized {
  return {
    name: 'mini',
    filename: 'mini.bundle',
    remotes: {},
    exposes: {},
    shared: {
      [sharedName]: {
        singleton: true,
        eager: false,
        import: importName,
        version: '0.80.0',
        requiredVersion: '0.80.0',
      },
    },
    shareStrategy: 'loaded-first',
    plugins: [],
    dts: false,
  };
}

function createPaths(projectDir: string, tmpDir: string) {
  return {
    asyncRequire: path.join(projectDir, 'asyncRequire.ts'),
    hostEntry: path.join(tmpDir, 'index.js'),
    initHost: path.join(tmpDir, 'init-host.js'),
    originalEntry: path.join(projectDir, 'index.js'),
    remoteEntry: path.join(tmpDir, 'mini.js'),
    remoteHMRSetup: path.join(tmpDir, 'remote-hmr.js'),
    remoteModuleRegistry: path.join(tmpDir, 'remote-module-registry.js'),
    projectDir,
    tmpDir,
  };
}

function createResolverContext(
  originModulePath: string,
  resolveRequest: CustomResolver,
): CustomResolutionContext {
  return {
    assetExts: [],
    allowHaste: false,
    customResolverOptions: {},
    disableHierarchicalLookup: false,
    doesFileExist: () => false,
    fileSystemLookup: () => ({ exists: false }),
    getPackage: () => null,
    getPackageForModule: () => null,
    mainFields: [],
    nodeModulesPaths: [],
    originModulePath,
    preferNativePlatform: false,
    redirectModulePath: (modulePath) => modulePath,
    resolveAsset: () => undefined,
    resolveHasteModule: () => undefined,
    resolveHastePackage: () => undefined,
    resolveRequest,
    sourceExts: [],
    unstable_conditionNames: [],
    unstable_conditionsByPlatform: {},
    unstable_enablePackageExports: false,
    unstable_logWarning: () => undefined,
  };
}

function createSharedResolverFixture({
  sharedName,
  importName,
}: Omit<SharedResolutionCase, 'expectedFileName'>) {
  const projectDir = '/project';
  const tmpDir = path.join(projectDir, 'node_modules', '.mf-metro');
  const config = createConfig(sharedName, importName);
  const fallbackResolver = vi.fn<CustomResolver>(() => ({
    type: 'sourceFile',
    filePath: '/fallback.js',
  }));
  const context = createResolverContext(
    path.join(projectDir, 'src', 'App.tsx'),
    fallbackResolver,
  );
  const vmManager: Pick<VirtualModuleManager, 'registerVirtualModule'> = {
    registerVirtualModule: vi.fn(),
  };

  const resolveRequest = createResolveRequest({
    isRemote: false,
    hacks: {
      patchHMRClient: false,
      patchInitializeCore: false,
    },
    options: config,
    paths: createPaths(projectDir, tmpDir),
    vmManager,
  });

  return {
    context,
    fallbackResolver,
    resolveRequest,
    vmManager,
  };
}

describe('createResolveRequest', () => {
  it.each([
    {
      sharedName: 'networking',
      importName: 'react-native/Libraries/Network/RCTNetworking',
      expectedFileName: 'networking.js',
    },
    {
      sharedName: 'lodash',
      importName: 'lodash',
      expectedFileName: 'lodash.js',
    },
    {
      sharedName: 'design/system',
      importName: '@acme/design-system',
      expectedFileName: 'design_system.js',
    },
  ])(
    'resolves $importName through the virtual shared module for $sharedName',
    ({ sharedName, importName, expectedFileName }) => {
      const expectedPath = path.join(
        '/project',
        'node_modules',
        '.mf-metro',
        'shared',
        expectedFileName,
      );

      const { context, fallbackResolver, resolveRequest, vmManager } =
        createSharedResolverFixture({ sharedName, importName });

      const resolved = resolveRequest(context, importName, 'ios');

      expect(resolved).toEqual({
        type: 'sourceFile',
        filePath: expectedPath,
      });

      // The resolver also registers the virtual module it returns. The path
      // must stay keyed by sharedName, while the generated code loads the
      // actual package import that Metro resolved.
      const [[registeredPath, registeredModule]] = vi.mocked(
        vmManager.registerVirtualModule,
      ).mock.calls;
      expect(registeredPath).toBe(expectedPath);
      expect(registeredModule()).toContain(
        `getModuleFromRegistry("${importName}")`,
      );
      expect(fallbackResolver).not.toHaveBeenCalled();
    },
  );
});
