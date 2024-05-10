import { ContainerManager } from '../src/ContainerManager';

describe('ContainerManager', () => {
  it('will not use containerPlugin while expose is empty', () => {
    const options = {
      name: '@module-federation/container-managers-test',
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(containerManager.enable).toEqual(false);
  });

  it('use options.name as globalName value by default  ', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: { '.': './src/Button.jsx' },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(containerManager.globalEntryName).toEqual(options.name);
  });

  it('get globalEntryName while typeof library.name is string ', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: { '.': './src/Button.jsx' },
      library: {
        name: 'testGlobalName',
        type: 'script',
      },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(containerManager.globalEntryName).toEqual(options.library.name);
  });

  // TODO: support in future
  it('can not accept typeof library.name!==string  ', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: { '.': './src/Button.jsx' },
      library: {
        name: { amd: 'amdName', commonjs: 'commonjsName', root: 'umdName' },
        type: 'script',
      },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(containerManager.globalEntryName).toEqual(
      '@module-federation/container-managers-test',
    );
  });

  it('set expose name by default', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: { './Button': './src/Button.jsx' },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(
      containerManager.containerPluginExposesOptions['./Button'].name,
    ).toEqual('__federation_expose_Button');
  });

  it('set expose import as array', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: { './Button': './src/Button.jsx' },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(
      Array.isArray(
        containerManager.containerPluginExposesOptions['./Button'].import,
      ),
    ).toEqual(true);
  });

  it('exposeFileNameImportMap', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: { './Button': './src/Button.jsx' },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);
    expect(
      JSON.stringify(
        containerManager.exposeFileNameImportMap['__federation_expose_Button'],
      ),
    ).toEqual(JSON.stringify([options.exposes['./Button']]));
  });

  it('exposeObject: return relative path which removed ext as well', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: { './Button': './src/Button.jsx' },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(JSON.stringify(containerManager.exposeObject['./Button'])).toEqual(
      JSON.stringify(['src/Button']),
    );
  });

  it('exposeFiles: get all expose files', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: {
        './Button': './src/Button.jsx',
        './Button2': './src/Button2.jsx',
      },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(JSON.stringify(containerManager.exposeFiles)).toEqual(
      JSON.stringify([
        options.exposes['./Button'],
        options.exposes['./Button2'],
      ]),
    );
  });

  it('manifestModuleInfos', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: {
        './Button': './src/Button.jsx',
        './Button2': './src/Button2.jsx',
      },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(containerManager.manifestModuleInfos).toMatchSnapshot();
  });

  it('webpackEntry', () => {
    const options = {
      name: '@module-federation/container-managers-test',
      exposes: {
        './Button': './src/Button.jsx',
        './Button2': './src/Button2.jsx',
      },
    };
    const containerManager = new ContainerManager();
    containerManager.init(options);

    expect(containerManager.webpackEntry).toMatchSnapshot();
  });
});
