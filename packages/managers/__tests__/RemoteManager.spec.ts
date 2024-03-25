import { RemoteManager } from '../src/RemoteManager';

describe('RemoteManager', () => {
  it('will not use ContainerReferencePlugin while shared is empty', () => {
    const options = {
      name: '@module-federation/remote-managers-test',
    };
    const remoteManager = new RemoteManager();
    remoteManager.init(options);

    expect(remoteManager.enable).toEqual(false);
  });

  it('normalizedOptions', () => {
    const options = {
      name: '@module-federation/remote-managers-test',
      remotes: {
        'remote-entry': 'remote1@http://localhost:3000/remoteEntry.js',
        'remote-version': 'remote2@1.2.3',
        'remote-default': 'remote3',
      },
    };
    const remoteManager = new RemoteManager();
    remoteManager.init(options);

    expect(
      JSON.stringify(remoteManager.normalizedOptions['remote-entry']),
    ).toEqual(
      JSON.stringify({
        name: 'remote1',
        entry: 'http://localhost:3000/remoteEntry.js',
        alias: 'remote-entry',
        shareScope: 'default',
      }),
    );
    expect(
      JSON.stringify(remoteManager.normalizedOptions['remote-version']),
    ).toEqual(
      JSON.stringify({
        name: 'remote2',
        version: '1.2.3',
        alias: 'remote-version',
        shareScope: 'default',
      }),
    );
    expect(
      JSON.stringify(remoteManager.normalizedOptions['remote-default']),
    ).toEqual(
      JSON.stringify({
        name: 'remote3',
        version: '*',
        alias: 'remote-default',
        shareScope: 'default',
      }),
    );
  });

  it('remotes: return original remotes', () => {
    const options = {
      name: '@module-federation/remote-managers-test',
      remotes: {
        'remote-entry': 'remote1@http://localhost:3000/remoteEntry.js',
        'remote-version': 'remote2@1.2.3',
        'remote-default': 'remote3',
      },
    };
    const remoteManager = new RemoteManager();
    remoteManager.init(options);

    expect(remoteManager.remotes).toEqual(options.remotes);
  });

  it('statsRemoteWithEmptyUsedIn', () => {
    const options = {
      name: '@module-federation/remote-managers-test',
      remotes: {
        'remote-entry': 'remote1@http://localhost:3000/remoteEntry.js',
        'remote-version': 'remote2@1.2.3',
        'remote-default': 'remote3',
      },
    };
    const remoteManager = new RemoteManager();
    remoteManager.init(options);

    expect(remoteManager.statsRemoteWithEmptyUsedIn).toMatchSnapshot();
  });

  it('dtsRemotes', () => {
    const options = {
      name: '@module-federation/remote-managers-test',
      remotes: {
        'remote-entry': 'remote1@http://localhost:3000/remoteEntry.js',
        'remote-version': 'remote2@1.2.3',
        'remote-default': 'remote3',
      },
    };
    const remoteManager = new RemoteManager();
    remoteManager.init(options);

    expect(remoteManager.dtsRemotes).toMatchSnapshot();
  });
});
