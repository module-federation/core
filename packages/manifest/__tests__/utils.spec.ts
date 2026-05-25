describe('getTypesMetaInfo', () => {
  const defaultTypesMetaInfo = {
    path: '',
    name: '',
    zip: '',
    api: '',
  };

  beforeEach(() => {
    jest.resetModules();
  });

  it('does not load the DTS core when DTS is disabled', async () => {
    const dtsCoreFactory = jest.fn(() => {
      throw new Error('DTS core should not be loaded');
    });

    jest.doMock('@module-federation/dts-plugin/core', dtsCoreFactory, {
      virtual: true,
    });
    jest.doMock(
      '@module-federation/sdk',
      () => ({
        normalizeOptions: jest.fn(() => {
          throw new Error('normalizeOptions should not be called');
        }),
      }),
      { virtual: true },
    );
    jest.doMock('../src/logger', () => ({
      __esModule: true,
      default: {
        warn: jest.fn(),
      },
    }));

    const { getTypesMetaInfo } = await import('../src/utils');

    expect(getTypesMetaInfo({ dts: false }, process.cwd())).toEqual(
      defaultTypesMetaInfo,
    );
    expect(dtsCoreFactory).not.toHaveBeenCalled();
  });

  it('loads the DTS core when DTS metadata is enabled', async () => {
    const normalizeOptions = jest.fn(
      (_enable: boolean, defaultOptions: Record<string, unknown> | boolean) =>
        (options: unknown) => {
          if (options === false) {
            return false;
          }

          if (options && typeof options === 'object') {
            return {
              ...(typeof defaultOptions === 'object' ? defaultOptions : {}),
              ...options,
            };
          }

          return defaultOptions;
        },
    );
    const isTSProject = jest.fn(() => true);
    const retrieveTypesAssetsInfo = jest.fn(() => ({
      apiFileName: 'api-types.d.ts',
      zipName: 'types.zip',
    }));

    jest.doMock(
      '@module-federation/dts-plugin/core',
      () => ({
        isTSProject,
        retrieveTypesAssetsInfo,
      }),
      { virtual: true },
    );
    jest.doMock(
      '@module-federation/sdk',
      () => ({
        normalizeOptions,
      }),
      { virtual: true },
    );
    jest.doMock('../src/logger', () => ({
      __esModule: true,
      default: {
        warn: jest.fn(),
      },
    }));

    const { getTypesMetaInfo } = await import('../src/utils');

    expect(getTypesMetaInfo({ dts: true }, '/workspace/app')).toEqual({
      path: '',
      name: '',
      zip: 'types.zip',
      api: 'api-types.d.ts',
    });
    expect(isTSProject).toHaveBeenCalledWith(true, '/workspace/app');
    expect(retrieveTypesAssetsInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        context: '/workspace/app',
        moduleFederationConfig: { dts: true },
      }),
    );
  });
});
