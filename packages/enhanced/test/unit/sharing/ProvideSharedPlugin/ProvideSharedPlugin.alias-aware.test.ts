/*
 * @jest-environment node
 */

import {
  ProvideSharedPlugin,
  createMockCompilation,
} from './shared-test-utils';

describe('ProvideSharedPlugin - alias-aware providing', () => {
  it('should provide aliased bare imports when only target is shared', () => {
    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        'next/dist/compiled/react': {
          version: '18.0.0',
          singleton: true,
        },
      },
    });

    const { mockCompilation } = createMockCompilation();

    const mockNormalModuleFactory = {
      hooks: {
        module: {
          tap: jest.fn(),
        },
      },
    } as any;

    let moduleHookCallback: any;
    mockNormalModuleFactory.hooks.module.tap.mockImplementation(
      (_name: string, cb: Function) => {
        moduleHookCallback = cb;
      },
    );

    // Spy on provideSharedModule to assert call
    // @ts-ignore
    plugin.provideSharedModule = jest.fn();

    const mockCompiler = {
      hooks: {
        compilation: {
          tap: jest.fn((_name: string, cb: Function) => {
            cb(mockCompilation, {
              normalModuleFactory: mockNormalModuleFactory,
            });
          }),
        },
        finishMake: { tapPromise: jest.fn() },
      },
    } as any;

    plugin.apply(mockCompiler);

    const mockModule = { layer: undefined } as any;
    const mockResource =
      '/project/node_modules/next/dist/compiled/react/index.js';
    const mockResolveData = { request: 'react', cacheable: true } as any;
    const mockResourceResolveData = {
      descriptionFileData: { version: '18.2.0' },
    } as any;

    const result = moduleHookCallback(
      mockModule,
      { resource: mockResource, resourceResolveData: mockResourceResolveData },
      mockResolveData,
    );

    expect(result).toBe(mockModule);
    expect(mockResolveData.cacheable).toBe(false);
    // @ts-ignore
    expect(plugin.provideSharedModule).toHaveBeenCalledWith(
      mockCompilation,
      expect.any(Map),
      'react',
      expect.objectContaining({
        version: '18.0.0',
        singleton: true,
        request: 'next/dist/compiled/react',
      }),
      mockResource,
      mockResourceResolveData,
    );
  });
});
