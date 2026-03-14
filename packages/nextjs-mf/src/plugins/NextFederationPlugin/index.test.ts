import type { Compiler } from 'webpack';
import type { NextFederationPluginOptions } from './next-fragments';

const bindLoggerToCompilerMock = jest.fn();
const copyFederationPluginApplyMock = jest.fn();
const moduleFederationPluginApplyMock = jest.fn();
const moduleFederationPluginCtorMock = jest
  .fn()
  .mockImplementation(() => ({ apply: moduleFederationPluginApplyMock }));

jest.mock('@module-federation/sdk', () => ({
  bindLoggerToCompiler: bindLoggerToCompilerMock,
}));

jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  getWebpackPath: jest.fn(() => '/mock/webpack/path'),
}));

jest.mock('../CopyFederationPlugin', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => ({ apply: copyFederationPluginApplyMock })),
}));

jest.mock('@module-federation/enhanced/webpack', () => ({
  ModuleFederationPlugin: moduleFederationPluginCtorMock,
}));

jest.mock('@module-federation/enhanced', () => ({
  FederationModulesPlugin: {
    getCompilationHooks: jest.fn(() => ({
      addContainerEntryDependency: {
        tap: jest.fn(),
      },
    })),
  },
}));

jest.mock('../../logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

import { NextFederationPlugin } from './index';

const createCompiler = (): Compiler =>
  ({
    context: '/workspace',
    options: {
      name: 'client',
      output: {},
      module: {
        rules: [],
      },
      plugins: [],
    },
    webpack: {
      EntryPlugin: {
        createDependency: jest.fn(() => 'noop-dependency'),
      },
      sources: {},
    },
    hooks: {
      make: {
        tapAsync: jest.fn(),
      },
      afterPlugins: {
        tap: jest.fn(),
      },
      normalModuleFactory: {
        tap: jest.fn(),
      },
      thisCompilation: {
        tap: jest.fn(),
      },
    },
  }) as unknown as Compiler;

describe('NextFederationPlugin apply', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['NEXT_PRIVATE_LOCAL_WEBPACK'] = 'true';
    delete process.env['FEDERATION_WEBPACK_PATH'];
  });

  it('applies enhanced ModuleFederationPlugin with normalized options', () => {
    const options: NextFederationPluginOptions = {
      name: 'host',
      filename: 'static/chunks/remoteEntry.js',
      exposes: {},
      remotes: {},
      shared: {},
      extraOptions: {
        skipSharingNextInternals: true,
      },
    };

    const plugin = new NextFederationPlugin(options);
    const compiler = createCompiler();
    const normalFederationPluginOptions = {
      name: 'host',
      filename: 'static/chunks/remoteEntry.js',
      remotes: {},
      exposes: {},
      shared: {},
    };

    jest
      .spyOn(
        plugin as unknown as { validateOptions: () => boolean },
        'validateOptions',
      )
      .mockReturnValue(true);
    jest
      .spyOn(
        plugin as unknown as { isServerCompiler: () => boolean },
        'isServerCompiler',
      )
      .mockReturnValue(false);
    jest
      .spyOn(
        plugin as unknown as {
          getNormalFederationPluginOptions: () => Record<string, unknown>;
        },
        'getNormalFederationPluginOptions',
      )
      .mockReturnValue(normalFederationPluginOptions);
    jest
      .spyOn(
        plugin as unknown as { applyConditionalPlugins: () => void },
        'applyConditionalPlugins',
      )
      .mockImplementation(() => undefined);

    plugin.apply(compiler);

    expect(bindLoggerToCompilerMock).toHaveBeenCalledWith(
      expect.anything(),
      compiler,
      'NextFederationPlugin',
    );
    expect(moduleFederationPluginCtorMock).toHaveBeenCalledWith(
      normalFederationPluginOptions,
    );
    expect(moduleFederationPluginApplyMock).toHaveBeenCalledWith(compiler);
  });

  it('allows app directory build manifest plugin configurations', () => {
    const options: NextFederationPluginOptions = {
      name: 'host',
      filename: 'static/chunks/remoteEntry.js',
      exposes: {},
      remotes: {},
      shared: {},
      extraOptions: {
        skipSharingNextInternals: true,
      },
    };
    const plugin = new NextFederationPlugin(options);
    const compiler = createCompiler();

    compiler.options.plugins = [
      {
        constructor: {
          name: 'BuildManifestPlugin',
        },
        appDirEnabled: true,
      } as unknown as Compiler['options']['plugins'][number],
    ];

    const result = (
      plugin as unknown as {
        validateOptions: (compiler: Compiler) => boolean;
      }
    ).validateOptions(compiler);

    expect(result).toBe(true);
  });
});
