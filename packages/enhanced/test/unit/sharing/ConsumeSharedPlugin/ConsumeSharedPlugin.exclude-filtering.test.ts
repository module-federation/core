/*
 * @rstest-environment node
 */

import {
  ConsumeSharedPlugin,
  createMockCompilation,
  mockGetDescriptionFile,
  resetAllMocks,
} from '../plugin-test-utils';
import {
  ConsumeSharedPluginInstance,
  createConsumeConfig,
  DescriptionFileResolver,
  ResolveFunction,
} from './helpers';
import type { Mock } from '@rstest/core';

const createHarness = (
  options = {
    shareScope: 'default',
    consumes: {
      'test-module': '^1.0.0',
    },
  },
) => {
  const plugin = new ConsumeSharedPlugin(
    options,
  ) as ConsumeSharedPluginInstance;
  const resolveMock = rs.fn<ResolveFunction>();
  const mockResolver = { resolve: resolveMock };
  const { mockCompilation } = createMockCompilation();
  const compilation = mockCompilation;

  compilation.inputFileSystem.readFile = rs.fn();
  compilation.resolverFactory = {
    get: rs.fn(() => mockResolver),
  };
  compilation.warnings = [] as Error[];
  compilation.errors = [] as Error[];
  compilation.contextDependencies = compilation.contextDependencies ?? {
    addAll: rs.fn(),
  };
  compilation.fileDependencies = compilation.fileDependencies ?? {
    addAll: rs.fn(),
  };
  compilation.missingDependencies = compilation.missingDependencies ?? {
    addAll: rs.fn(),
  };
  compilation.compiler = {
    context: '/test/context',
  };

  const descriptionFileMock =
    mockGetDescriptionFile as unknown as Mock<DescriptionFileResolver>;

  resolveMock.mockReset();
  descriptionFileMock.mockReset();

  const setResolve = (impl: ResolveFunction) => {
    resolveMock.mockImplementation(impl);
  };

  const setDescription = (impl: DescriptionFileResolver) => {
    descriptionFileMock.mockImplementation(impl);
  };

  return {
    plugin,
    compilation,
    resolveMock,
    descriptionFileMock,
    setResolve,
    setDescription,
  };
};

describe('ConsumeSharedPlugin', () => {
  describe('exclude version filtering logic', () => {
    beforeEach(() => {
      resetAllMocks();
    });

    const successResolve: ResolveFunction = (
      _context,
      _lookupStartPath,
      _request,
      _resolveContext,
      callback,
    ) => {
      callback(null, '/resolved/path/to/test-module');
    };

    const descriptionWithVersion =
      (version: string): DescriptionFileResolver =>
      (_fs, _dir, _files, callback) => {
        callback(null, {
          data: { name: 'test-module', version },
          path: '/path/to/package.json',
        });
      };

    it('should include module when version does not match exclude filter', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        exclude: {
          version: '^2.0.0',
        },
      });

      harness.setResolve(successResolve);
      harness.setDescription(descriptionWithVersion('1.5.0'));

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
    });

    it('should exclude module when version matches exclude filter', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        exclude: {
          version: '^1.0.0',
        },
      });

      harness.setResolve(successResolve);
      harness.setDescription(descriptionWithVersion('1.5.0'));

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeUndefined();
    });

    it('should generate singleton warning for exclude version filters', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        singleton: true,
        exclude: {
          version: '^2.0.0',
        },
      });

      harness.setResolve(successResolve);
      harness.setDescription(descriptionWithVersion('1.5.0'));

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
      expect(harness.compilation.warnings).toHaveLength(1);
      expect(harness.compilation.warnings[0]?.message).toContain(
        'singleton: true',
      );
      expect(harness.compilation.warnings[0]?.message).toContain(
        'exclude.version',
      );
    });

    it('should handle fallback version for exclude filters - include when fallback matches', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        exclude: {
          version: '^2.0.0',
          fallbackVersion: '1.5.0',
        },
      });

      harness.setResolve(successResolve);
      harness.setDescription(descriptionWithVersion('1.5.0'));

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
    });

    it('should return module when exclude filter fails but no importResolved', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        import: undefined,
        exclude: {
          version: '^1.0.0',
        },
      });

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
    });
  });

  describe('package.json reading error scenarios', () => {
    beforeEach(() => {
      resetAllMocks();
    });

    const successResolve: ResolveFunction = (
      _context,
      _lookupStartPath,
      _request,
      _resolveContext,
      callback,
    ) => {
      callback(null, '/resolved/path/to/test-module');
    };

    it('should handle getDescriptionFile errors gracefully - include filters', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        include: {
          version: '^1.0.0',
        },
      });

      harness.setResolve(successResolve);
      const failingDescription: DescriptionFileResolver = (
        _fs,
        _dir,
        _files,
        callback,
      ) => {
        callback(new Error('File system error'));
      };
      harness.setDescription(failingDescription);

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
    });

    it('should handle missing package.json data gracefully - include filters', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        include: {
          version: '^1.0.0',
        },
      });

      harness.setResolve(successResolve);
      const missingData: DescriptionFileResolver = (
        _fs,
        _dir,
        _files,
        callback,
      ) => {
        callback(null, undefined);
      };
      harness.setDescription(missingData);

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
    });

    it('should handle mismatched package name gracefully - include filters', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        include: {
          version: '^1.0.0',
        },
      });

      harness.setResolve(successResolve);
      const mismatchedName: DescriptionFileResolver = (
        _fs,
        _dir,
        _files,
        callback,
      ) => {
        callback(null, {
          data: { name: 'other-module', version: '1.5.0' },
          path: '/path/to/package.json',
        });
      };
      harness.setDescription(mismatchedName);

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
    });

    it('should handle getDescriptionFile errors for exclude filters', async () => {
      const harness = createHarness();
      const config = createConsumeConfig({
        exclude: {
          version: '^1.0.0',
        },
      });

      harness.setResolve(successResolve);
      const failingDescription: DescriptionFileResolver = (
        _fs,
        _dir,
        _files,
        callback,
      ) => {
        callback(new Error('FS failure'));
      };
      harness.setDescription(failingDescription);

      const result = await harness.plugin.createConsumeSharedModule(
        harness.compilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
    });
  });
});
