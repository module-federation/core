import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { Compiler } from 'webpack';
import type { NextFederationPluginExtraOptions } from './next-fragments';

jest.mock(
  '@module-federation/node',
  () => ({
    ChunkCorrelationPlugin: jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    })),
  }),
  { virtual: true },
);

jest.mock('../container/InvertedContainerPlugin', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  })),
}));

jest.mock('./FederatedStatsCompatibilityPlugin', () => ({
  FederatedStatsCompatibilityPlugin: jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  })),
}));

jest.mock('../../logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const { ChunkCorrelationPlugin } = jest.requireMock('@module-federation/node');
const InvertedContainerPlugin = jest.requireMock(
  '../container/InvertedContainerPlugin',
).default;
const { FederatedStatsCompatibilityPlugin } = jest.requireMock(
  './FederatedStatsCompatibilityPlugin',
);
const { applyClientPlugins } =
  require('./apply-client-plugins') as typeof import('./apply-client-plugins');

const options: moduleFederationPlugin.ModuleFederationPluginOptions = {
  name: 'host',
};

const createCompiler = () =>
  ({
    options: {
      output: {
        publicPath: '/_next/',
      },
    },
  }) as Compiler;

describe('applyClientPlugins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([undefined, false])(
    'emits compatibility stats when skipFederatedStats is %s',
    (skipFederatedStats) => {
      const compiler = createCompiler();
      const extraOptions: NextFederationPluginExtraOptions = {
        skipFederatedStats,
      };

      applyClientPlugins(compiler, { ...options }, extraOptions);

      expect(FederatedStatsCompatibilityPlugin).toHaveBeenCalledWith({
        filenames: [
          'static/chunks/federated-stats.json',
          'server/federated-stats.json',
        ],
        manifest: undefined,
      });
      expect(ChunkCorrelationPlugin).not.toHaveBeenCalled();
      expect(InvertedContainerPlugin).toHaveBeenCalledTimes(1);
    },
  );

  it.each([{ manifest: false }, { manifest: { disableAssetsAnalyze: true } }])(
    'uses full chunk correlation for $manifest',
    (manifestOptions) => {
      const compiler = createCompiler();

      applyClientPlugins(
        compiler,
        { ...options, ...manifestOptions },
        { skipFederatedStats: false },
      );

      expect(ChunkCorrelationPlugin).toHaveBeenCalledWith({
        filename: [
          'static/chunks/federated-stats.json',
          'server/federated-stats.json',
        ],
      });
      expect(FederatedStatsCompatibilityPlugin).not.toHaveBeenCalled();
    },
  );

  it('omits chunk correlation without affecting other client plugins', () => {
    const compiler = createCompiler();

    applyClientPlugins(compiler, { ...options }, { skipFederatedStats: true });

    expect(ChunkCorrelationPlugin).not.toHaveBeenCalled();
    expect(FederatedStatsCompatibilityPlugin).not.toHaveBeenCalled();
    expect(InvertedContainerPlugin).toHaveBeenCalledTimes(1);
  });
});
