import { SharedManager } from '../src/SharedManager';

describe('SharedManager', () => {
  it('will not use SharedPlugin while shared is empty', () => {
    const options = {
      name: '@module-federation/shared-managers-test',
    };
    const sharedManager = new SharedManager();
    sharedManager.init(options);

    expect(sharedManager.enable).toEqual(false);
  });

  it('normalizedOptions', () => {
    const options = {
      name: '@module-federation/shared-managers-test',
      shared: {
        react: {},
        'react-dom': { singleton: false, requiredVersion: '^18.0.0' },
      },
    };
    const sharedManager = new SharedManager();
    sharedManager.init(options);

    expect(
      Object.keys(sharedManager.normalizedOptions['react']).every((key) =>
        [
          'singleton',
          'requiredVersion',
          'shareScope',
          'name',
          'version',
          'eager',
        ].includes(key),
      ),
    ).toEqual(true);
    expect(sharedManager.normalizedOptions['react-dom']).toMatchSnapshot();
  });

  it('sharedPluginOptions', () => {
    const options = {
      name: '@module-federation/shared-managers-test',
      shared: {
        react: {},
      },
    };
    const sharedManager = new SharedManager();
    sharedManager.init(options);

    expect(
      Object.keys(sharedManager.sharedPluginOptions.shared['react']).every(
        (key) =>
          [
            'singleton',
            'requiredVersion',
            'shareScope',
            'name',
            'version',
            'eager',
            'import',
          ].includes(key),
      ),
    ).toEqual(true);

    expect(sharedManager.sharedPluginOptions.shareScope).toEqual('default');
  });
});
