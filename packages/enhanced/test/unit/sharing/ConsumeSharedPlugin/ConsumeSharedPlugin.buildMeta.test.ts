/*
 * @jest-environment node
 */

import ConsumeSharedPlugin from '../../../../src/lib/sharing/ConsumeSharedPlugin';
import ConsumeSharedModule from '../../../../src/lib/sharing/ConsumeSharedModule';
import type AsyncDependenciesBlock from 'webpack/lib/AsyncDependenciesBlock';
import type Dependency from 'webpack/lib/Dependency';
import type Module from 'webpack/lib/Module';
import type { SemVerRange } from 'webpack/lib/util/semver';
import { createSharingTestEnvironment, shareScopes } from '../utils';
import { resetAllMocks } from '../plugin-test-utils';

const toSemVerRange = (range: string): SemVerRange =>
  range as unknown as SemVerRange;

// Mock webpack internals
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  getWebpackPath: jest.fn(() => 'webpack'),
  normalizeWebpackPath: jest.fn((p) => p),
}));

jest.mock(
  '../../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => {
    return jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    }));
  },
);

describe('ConsumeSharedPlugin - BuildMeta Copying', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('seal hook buildMeta copying', () => {
    it('should copy buildMeta from fallback module to ConsumeSharedModule (eager mode)', () => {
      const testEnv = createSharingTestEnvironment();

      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Create a mock ConsumeSharedModule with fallback dependency (eager mode)
      const mockConsumeSharedModule = new ConsumeSharedModule('/test', {
        shareScope: 'default',
        shareKey: 'react',
        requiredVersion: toSemVerRange('^17.0.0'),
        eager: true,
        import: 'react',
        packageName: 'react',
        singleton: false,
        strictVersion: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'react',
        include: undefined,
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      });

      // Create a mock fallback module with buildMeta/buildInfo
      const mockFallbackModule = {
        buildMeta: {
          exportsType: 'namespace',
          defaultObject: 'redirect',
          sideEffectFree: true,
        },
        buildInfo: {
          strict: true,
          exportsArgument: '__webpack_exports__',
        },
      } as unknown as Module;

      // Create a mock dependency that links to the fallback module
      const mockDependency = {} as unknown as Dependency;
      mockConsumeSharedModule.dependencies = [mockDependency];

      // Mock the moduleGraph.getModule to return our fallback module
      testEnv.mockCompilation.moduleGraph.getModule = jest
        .fn()
        .mockReturnValue(mockFallbackModule);

      // Add the ConsumeSharedModule to compilation.modules
      testEnv.mockCompilation.modules = [mockConsumeSharedModule];

      // Simulate the finishModules hook execution by calling it directly
      const finishModulesHook = testEnv.mockCompilation.hooks.finishModules;
      expect(finishModulesHook.tapAsync).toHaveBeenCalledWith(
        {
          name: 'ConsumeSharedPlugin',
          stage: 10,
        },
        expect.any(Function),
      );

      // Get the callback that was registered and execute it
      const finishModulesCallback = finishModulesHook.tapAsync.mock.calls[0][1];
      finishModulesCallback(testEnv.mockCompilation.modules, () => {});

      // Verify buildMeta was copied correctly
      expect(mockConsumeSharedModule.buildMeta).toEqual({
        exportsType: 'namespace',
        defaultObject: 'redirect',
        sideEffectFree: true,
      });

      // Verify buildInfo was copied correctly
      expect(mockConsumeSharedModule.buildInfo).toEqual({
        strict: true,
        exportsArgument: '__webpack_exports__',
      });

      // Verify moduleGraph.getModule was called with the correct dependency
      expect(
        testEnv.mockCompilation.moduleGraph.getModule,
      ).toHaveBeenCalledWith(mockDependency);
    });

    it('should copy buildMeta from fallback module to ConsumeSharedModule (async mode)', () => {
      const testEnv = createSharingTestEnvironment();

      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          lodash: '^4.0.0',
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Create a mock ConsumeSharedModule with fallback dependency (async mode)
      const mockConsumeSharedModule = new ConsumeSharedModule('/test', {
        shareScope: 'default',
        shareKey: 'lodash',
        requiredVersion: toSemVerRange('^4.0.0'),
        eager: false, // async mode
        import: 'lodash',
        packageName: 'lodash',
        singleton: false,
        strictVersion: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'lodash',
        include: undefined,
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      });

      // Create a mock fallback module with different buildMeta/buildInfo
      const mockFallbackModule = {
        buildMeta: {
          exportsType: 'default',
          defaultObject: false,
          sideEffectFree: false,
        },
        buildInfo: {
          strict: false,
          exportsArgument: 'exports',
        },
      } as unknown as Module;

      // Create a mock async dependency block with dependency
      const mockDependency = {} as unknown as Dependency;
      const mockAsyncBlock = {
        dependencies: [mockDependency],
      } as unknown as AsyncDependenciesBlock;
      mockConsumeSharedModule.blocks = [mockAsyncBlock];

      // Mock the moduleGraph.getModule to return our fallback module
      testEnv.mockCompilation.moduleGraph.getModule = jest
        .fn()
        .mockReturnValue(mockFallbackModule);

      // Add the ConsumeSharedModule to compilation.modules
      testEnv.mockCompilation.modules = [mockConsumeSharedModule];

      // Get the finishModules callback and execute it
      const finishModulesHook = testEnv.mockCompilation.hooks.finishModules;
      const finishModulesCallback = finishModulesHook.tapAsync.mock.calls[0][1];
      finishModulesCallback(testEnv.mockCompilation.modules, () => {});

      // Verify buildMeta was copied correctly
      expect(mockConsumeSharedModule.buildMeta).toEqual({
        exportsType: 'default',
        defaultObject: false,
        sideEffectFree: false,
      });

      // Verify buildInfo was copied correctly
      expect(mockConsumeSharedModule.buildInfo).toEqual({
        strict: false,
        exportsArgument: 'exports',
      });

      // Verify moduleGraph.getModule was called with the correct dependency
      expect(
        testEnv.mockCompilation.moduleGraph.getModule,
      ).toHaveBeenCalledWith(mockDependency);
    });

    it('should not copy buildMeta when fallback module has no buildMeta', () => {
      const testEnv = createSharingTestEnvironment();

      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          'missing-meta': '^1.0.0',
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Create a mock ConsumeSharedModule
      const mockConsumeSharedModule = new ConsumeSharedModule('/test', {
        shareScope: 'default',
        shareKey: 'missing-meta',
        requiredVersion: toSemVerRange('^1.0.0'),
        eager: true,
        import: 'missing-meta',
        packageName: 'missing-meta',
        singleton: false,
        strictVersion: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'missing-meta',
        include: undefined,
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      });

      // Store original buildMeta/buildInfo
      const originalBuildMeta = mockConsumeSharedModule.buildMeta;
      const originalBuildInfo = mockConsumeSharedModule.buildInfo;

      // Create a mock fallback module without buildMeta/buildInfo
      const mockFallbackModule = {} as unknown as Module;

      const mockDependency = {} as unknown as Dependency;
      mockConsumeSharedModule.dependencies = [mockDependency];

      testEnv.mockCompilation.moduleGraph.getModule = jest
        .fn()
        .mockReturnValue(mockFallbackModule);
      testEnv.mockCompilation.modules = [mockConsumeSharedModule];

      // Execute the finishModules callback
      const finishModulesHook = testEnv.mockCompilation.hooks.finishModules;
      const finishModulesCallback = finishModulesHook.tapAsync.mock.calls[0][1];
      finishModulesCallback(testEnv.mockCompilation.modules, () => {});

      // Verify buildMeta/buildInfo were not modified
      expect(mockConsumeSharedModule.buildMeta).toBe(originalBuildMeta);
      expect(mockConsumeSharedModule.buildInfo).toBe(originalBuildInfo);
    });

    it('should skip non-ConsumeSharedModule instances', () => {
      const testEnv = createSharingTestEnvironment();

      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Create a mock non-ConsumeSharedModule
      const mockOtherModule = {
        type: 'javascript/auto',
        dependencies: [],
        blocks: [],
        buildMeta: { original: true },
        buildInfo: { original: true },
      };

      testEnv.mockCompilation.modules = [mockOtherModule];

      // Execute the finishModules callback
      const finishModulesHook = testEnv.mockCompilation.hooks.finishModules;
      const finishModulesCallback = finishModulesHook.tapAsync.mock.calls[0][1];
      finishModulesCallback(testEnv.mockCompilation.modules, () => {});

      // Verify the other module was not modified
      expect(mockOtherModule.buildMeta).toEqual({ original: true });
      expect(mockOtherModule.buildInfo).toEqual({ original: true });

      // Verify moduleGraph.getModule was not called
      expect(
        testEnv.mockCompilation.moduleGraph.getModule,
      ).not.toHaveBeenCalled();
    });

    it('should skip ConsumeSharedModules without import option', () => {
      const testEnv = createSharingTestEnvironment();

      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          'no-import': '^1.0.0',
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Create a mock ConsumeSharedModule without import
      const mockConsumeSharedModule = new ConsumeSharedModule('/test', {
        shareScope: 'default',
        shareKey: 'no-import',
        requiredVersion: toSemVerRange('^1.0.0'),
        eager: false,
        import: undefined, // No import
        packageName: 'no-import',
        singleton: false,
        strictVersion: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'no-import',
        include: undefined,
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      });

      const originalBuildMeta = mockConsumeSharedModule.buildMeta;
      const originalBuildInfo = mockConsumeSharedModule.buildInfo;

      testEnv.mockCompilation.modules = [mockConsumeSharedModule];

      // Execute the finishModules callback
      const finishModulesHook = testEnv.mockCompilation.hooks.finishModules;
      const finishModulesCallback = finishModulesHook.tapAsync.mock.calls[0][1];
      finishModulesCallback(testEnv.mockCompilation.modules, () => {});

      // Verify buildMeta/buildInfo were not modified
      expect(mockConsumeSharedModule.buildMeta).toBe(originalBuildMeta);
      expect(mockConsumeSharedModule.buildInfo).toBe(originalBuildInfo);

      // Verify moduleGraph.getModule was not called
      expect(
        testEnv.mockCompilation.moduleGraph.getModule,
      ).not.toHaveBeenCalled();
    });

    it('should handle missing fallback module gracefully', () => {
      const testEnv = createSharingTestEnvironment();

      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          'missing-fallback': '^1.0.0',
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      const mockConsumeSharedModule = new ConsumeSharedModule('/test', {
        shareScope: 'default',
        shareKey: 'missing-fallback',
        requiredVersion: toSemVerRange('^1.0.0'),
        eager: true,
        import: 'missing-fallback',
        packageName: 'missing-fallback',
        singleton: false,
        strictVersion: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'missing-fallback',
        include: undefined,
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      });

      const originalBuildMeta = mockConsumeSharedModule.buildMeta;
      const originalBuildInfo = mockConsumeSharedModule.buildInfo;

      const mockDependency = {} as unknown as Dependency;
      mockConsumeSharedModule.dependencies = [mockDependency];

      // Mock moduleGraph.getModule to return null/undefined
      testEnv.mockCompilation.moduleGraph.getModule = jest
        .fn()
        .mockReturnValue(null);
      testEnv.mockCompilation.modules = [mockConsumeSharedModule];

      // Execute the finishModules callback
      const finishModulesHook = testEnv.mockCompilation.hooks.finishModules;
      const finishModulesCallback = finishModulesHook.tapAsync.mock.calls[0][1];

      // Should not throw
      expect(() =>
        finishModulesCallback(testEnv.mockCompilation.modules, () => {}),
      ).not.toThrow();

      // Verify buildMeta/buildInfo were not modified
      expect(mockConsumeSharedModule.buildMeta).toBe(originalBuildMeta);
      expect(mockConsumeSharedModule.buildInfo).toBe(originalBuildInfo);
    });

    it('should copy buildMeta using spread operator following webpack DelegatedModule pattern', () => {
      const testEnv = createSharingTestEnvironment();

      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          'spread-test': '^1.0.0',
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      const mockConsumeSharedModule = new ConsumeSharedModule('/test', {
        shareScope: 'default',
        shareKey: 'spread-test',
        requiredVersion: toSemVerRange('^1.0.0'),
        eager: true,
        import: 'spread-test',
        packageName: 'spread-test',
        singleton: false,
        strictVersion: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'spread-test',
        include: undefined,
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      });

      // Create a fallback module with nested objects to test deep copying
      const originalBuildMeta = {
        exportsType: 'namespace',
        defaultObject: 'redirect',
        nested: { prop: 'value' },
      };

      const originalBuildInfo = {
        strict: true,
        nested: { info: 'data' },
      };

      const mockFallbackModule = {
        buildMeta: originalBuildMeta,
        buildInfo: originalBuildInfo,
      } as unknown as Module;

      const mockDependency = {} as unknown as Dependency;
      mockConsumeSharedModule.dependencies = [mockDependency];

      testEnv.mockCompilation.moduleGraph.getModule = jest
        .fn()
        .mockReturnValue(mockFallbackModule);
      testEnv.mockCompilation.modules = [mockConsumeSharedModule];

      // Execute the finishModules callback
      const finishModulesHook = testEnv.mockCompilation.hooks.finishModules;
      const finishModulesCallback = finishModulesHook.tapAsync.mock.calls[0][1];
      finishModulesCallback(testEnv.mockCompilation.modules, () => {});

      // Verify buildMeta was copied (shallow copy via spread operator)
      expect(mockConsumeSharedModule.buildMeta).toEqual(originalBuildMeta);
      expect(mockConsumeSharedModule.buildMeta).not.toBe(originalBuildMeta); // Different object reference

      // Verify buildInfo was copied (shallow copy via spread operator)
      expect(mockConsumeSharedModule.buildInfo).toEqual(originalBuildInfo);
      expect(mockConsumeSharedModule.buildInfo).not.toBe(originalBuildInfo); // Different object reference

      // Verify nested objects are shared references (shallow copy behavior)
      expect(mockConsumeSharedModule.buildMeta!['nested']).toBe(
        originalBuildMeta.nested,
      );
      expect(mockConsumeSharedModule.buildInfo!['nested']).toBe(
        originalBuildInfo.nested,
      );
    });
  });

  describe('hook timing verification', () => {
    it('should register finishModules hook with lower priority stage to run after FlagDependencyExportsPlugin', () => {
      const testEnv = createSharingTestEnvironment();

      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          'timing-test': '^1.0.0',
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Verify that finishModules hook was registered with high priority
      expect(
        testEnv.mockCompilation.hooks.finishModules.tapAsync,
      ).toHaveBeenCalledWith(
        {
          name: 'ConsumeSharedPlugin',
          stage: 10, // Use STAGE_BASIC (10) to run after FlagDependencyExportsPlugin
        },
        expect.any(Function),
      );

      // The finishModules hook with stage 10 should run after other plugins like FlagDependencyExportsPlugin
      // This ensures buildMeta is available when webpack's export analysis occurs
    });
  });
});
