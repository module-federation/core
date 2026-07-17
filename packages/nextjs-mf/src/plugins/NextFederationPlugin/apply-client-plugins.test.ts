import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { Compiler } from 'webpack';

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

  it('emits compatibility stats from the manifest', () => {
    const compiler = createCompiler();

    applyClientPlugins(compiler, { ...options }, {});

    expect(FederatedStatsCompatibilityPlugin).toHaveBeenCalledWith({
      filenames: [
        'static/chunks/federated-stats.json',
        'server/federated-stats.json',
      ],
      manifest: undefined,
    });
    expect(ChunkCorrelationPlugin).not.toHaveBeenCalled();
    expect(InvertedContainerPlugin).toHaveBeenCalledTimes(1);
  });

  it.each([{ manifest: false }, { manifest: { disableAssetsAnalyze: true } }])(
    'uses full chunk correlation for $manifest',
    (manifestOptions) => {
      const compiler = createCompiler();

      applyClientPlugins(compiler, { ...options, ...manifestOptions }, {});

      expect(ChunkCorrelationPlugin).toHaveBeenCalledWith({
        filename: [
          'static/chunks/federated-stats.json',
          'server/federated-stats.json',
        ],
      });
      expect(FederatedStatsCompatibilityPlugin).not.toHaveBeenCalled();
    },
  );
});
