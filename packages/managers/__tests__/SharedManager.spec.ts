import { SharedManager } from '../src/SharedManager';

// Mock the findPkg method to return stable values
const mockFindPkg = jest.fn().mockImplementation((name: string) => {
  // Return stable package versions to avoid dependency pollution in CI/local
  const mockPackages: Record<string, any> = {
    react: { version: '18.2.0' },
    'react-dom': { version: '18.2.0' },
  };

  return {
    pkg: mockPackages[name] || { version: '1.0.0' },
    path: '',
    pkgPath: '',
  };
});

// Mock the SharedManager class to override findPkg method
jest.mock('../src/SharedManager', () => {
  const actual = jest.requireActual('../src/SharedManager');
  return {
    SharedManager: class extends actual.SharedManager {
      findPkg = mockFindPkg;
    },
  };
});

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
