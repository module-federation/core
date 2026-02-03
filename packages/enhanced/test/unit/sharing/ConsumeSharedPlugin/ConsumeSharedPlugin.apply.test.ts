/*
 * @rstest-environment node
 */

import {
  ConsumeSharedPlugin,
  shareScopes,
  createSharingTestEnvironment,
  mockConsumeSharedModule,
  resetAllMocks,
  federationRuntimePluginMock,
} from '../plugin-test-utils';

type SharingTestEnvironment = ReturnType<typeof createSharingTestEnvironment>;
type ConsumeSharedPluginInstance =
  import('../../../../src/lib/sharing/ConsumeSharedPlugin').default;

describe('ConsumeSharedPlugin', () => {
  describe('apply method', () => {
    let testEnv: SharingTestEnvironment;

    beforeEach(() => {
      resetAllMocks();
      // Use the new utility function to create a standardized test environment
      testEnv = createSharingTestEnvironment();
    });

    it('should register hooks when plugin is applied', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      }) as ConsumeSharedPluginInstance;

      // Apply the plugin
      plugin.apply(testEnv.compiler);

      // Simulate the compilation phase
      testEnv.simulateCompilation();

      // Check that thisCompilation and compilation hooks were tapped
      expect(testEnv.compiler.hooks.thisCompilation.tap).toHaveBeenCalled();
      expect(
        testEnv.mockCompilation.hooks.additionalTreeRuntimeRequirements.tap,
      ).toHaveBeenCalled();
    });

    it('should add runtime modules when runtimeRequirements callback is called', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      }) as ConsumeSharedPluginInstance;

      // Apply the plugin
      plugin.apply(testEnv.compiler);

      // Simulate the compilation phase
      testEnv.simulateCompilation();

      // Simulate runtime requirements
      const runtimeRequirements = testEnv.simulateRuntimeRequirements();

      // Verify runtime requirement was added
      expect(runtimeRequirements.has('__webpack_share_scopes__')).toBe(true);

      // Verify runtime modules were added
      expect(testEnv.mockCompilation.addRuntimeModule).toHaveBeenCalled();
    });
  });

  describe('plugin registration and hooks', () => {
    let plugin: ConsumeSharedPluginInstance;
    let mockCompiler: any;
    let mockCompilation: any;
    let mockNormalModuleFactory: any;
    let mockFactorizeHook: any;
    let mockCreateModuleHook: any;

    beforeEach(() => {
      resetAllMocks();

      mockFactorizeHook = {
        tapPromise: rs.fn(),
      };

      mockCreateModuleHook = {
        tapPromise: rs.fn(),
      };

      mockNormalModuleFactory = {
        hooks: {
          factorize: mockFactorizeHook,
          createModule: mockCreateModuleHook,
        },
      };

      mockCompilation = {
        dependencyFactories: {
          set: rs.fn(),
        },
        hooks: {
          additionalTreeRuntimeRequirements: {
            tap: rs.fn(),
          },
          finishModules: {
            tap: rs.fn(),
            tapAsync: rs.fn(),
          },
          seal: {
            tap: rs.fn(),
          },
        },
        addRuntimeModule: rs.fn(),
      };

      const mockThisCompilationHook = {
        tap: rs.fn(
          (
            name: string,
            callback: (
              compilation: unknown,
              params: { normalModuleFactory: unknown },
            ) => void,
          ) => {
            // Simulate the hook being called
            callback(mockCompilation, {
              normalModuleFactory: mockNormalModuleFactory,
            });
          },
        ),
      };

      mockCompiler = {
        context: '/test/context',
        hooks: {
          thisCompilation: mockThisCompilationHook,
        },
      };

      plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'test-module': '^1.0.0',
          'lodash/': {
            shareKey: 'lodash',
            shareScope: 'default',
          },
          react: {
            shareKey: 'react',
            shareScope: 'default',
            issuerLayer: 'client',
          },
        },
      }) as ConsumeSharedPluginInstance;
    });

    it('should register thisCompilation hook during apply', () => {
      plugin.apply(mockCompiler);

      expect(mockCompiler.hooks.thisCompilation.tap).toHaveBeenCalledWith(
        'ConsumeSharedPlugin',
        expect.any(Function),
      );
    });

    it('should register factorize and createModule hooks during compilation', () => {
      plugin.apply(mockCompiler);

      expect(mockFactorizeHook.tapPromise).toHaveBeenCalledWith(
        'ConsumeSharedPlugin',
        expect.any(Function),
      );
      expect(mockCreateModuleHook.tapPromise).toHaveBeenCalledWith(
        'ConsumeSharedPlugin',
        expect.any(Function),
      );
    });

    it('should set up dependency factories during compilation', () => {
      plugin.apply(mockCompiler);

      expect(mockCompilation.dependencyFactories.set).toHaveBeenCalledWith(
        expect.any(Function), // ConsumeSharedFallbackDependency
        mockNormalModuleFactory,
      );
    });

    it('should register additionalTreeRuntimeRequirements hook', () => {
      plugin.apply(mockCompiler);

      expect(
        mockCompilation.hooks.additionalTreeRuntimeRequirements.tap,
      ).toHaveBeenCalledWith('ConsumeSharedPlugin', expect.any(Function));
    });

    it('should set FEDERATION_WEBPACK_PATH environment variable', () => {
      const originalEnv = process.env['FEDERATION_WEBPACK_PATH'];
      delete process.env['FEDERATION_WEBPACK_PATH'];

      plugin.apply(mockCompiler);

      expect(process.env['FEDERATION_WEBPACK_PATH']).toBeDefined();

      // Restore original environment
      if (originalEnv) {
        process.env['FEDERATION_WEBPACK_PATH'] = originalEnv;
      } else {
        delete process.env['FEDERATION_WEBPACK_PATH'];
      }
    });

    it('should apply FederationRuntimePlugin during plugin application', () => {
      // Clear any previous calls
      federationRuntimePluginMock.mockClear();

      plugin.apply(mockCompiler);

      expect(federationRuntimePluginMock).toHaveBeenCalled();
    });
  });
});
