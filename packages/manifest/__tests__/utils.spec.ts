import type { moduleFederationPlugin } from '@module-federation/sdk';

describe('getTypesMetaInfo', () => {
  function loadGetTypesMetaInfo(dtsCoreFactory: () => Record<string, unknown>) {
    let getTypesMetaInfo!: typeof import('../src/utils').getTypesMetaInfo;
    jest.isolateModules(() => {
      jest.doMock('@module-federation/dts-plugin/core', dtsCoreFactory);
      ({ getTypesMetaInfo } =
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../src/utils') as typeof import('../src/utils'));
    });
    return getTypesMetaInfo;
  }

  afterEach(() => {
    jest.dontMock('@module-federation/dts-plugin/core');
  });

  it('does not load @module-federation/dts-plugin/core when dts is disabled', () => {
    const dtsCoreFactory = jest.fn(() => ({
      isTSProject: jest.fn(),
      retrieveTypesAssetsInfo: jest.fn(),
    }));
    const getTypesMetaInfo = loadGetTypesMetaInfo(dtsCoreFactory);

    const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
      name: 'remote',
      dts: false,
    };

    expect(getTypesMetaInfo(options, '/project')).toEqual({
      path: '',
      name: '',
      zip: '',
      api: '',
    });
    expect(dtsCoreFactory).not.toHaveBeenCalled();
  });

  it('loads @module-federation/dts-plugin/core when dts is enabled', () => {
    const retrieveTypesAssetsInfo = jest.fn(() => ({
      apiFileName: '@mf-types.d.ts',
      zipName: '@mf-types.zip',
    }));
    const dtsCoreFactory = jest.fn(() => ({
      isTSProject: jest.fn(() => true),
      retrieveTypesAssetsInfo,
    }));
    const getTypesMetaInfo = loadGetTypesMetaInfo(dtsCoreFactory);

    expect(dtsCoreFactory).not.toHaveBeenCalled();

    expect(getTypesMetaInfo({ name: 'remote' }, '/project')).toEqual({
      path: '',
      name: '',
      zip: '@mf-types.zip',
      api: '@mf-types.d.ts',
    });
    expect(dtsCoreFactory).toHaveBeenCalledTimes(1);
    expect(retrieveTypesAssetsInfo).toHaveBeenCalledWith(
      expect.objectContaining({ context: '/project' }),
    );
  });
});
