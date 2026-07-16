import type { moduleFederationPlugin } from '@module-federation/sdk';
import { ChunkCorrelationPlugin } from '@module-federation/node';
import type { Compiler } from 'webpack';
import InvertedContainerPlugin from '../container/InvertedContainerPlugin';
import { applyClientPlugins } from './apply-client-plugins';
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

jest.mock('../../logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

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
    'applies chunk correlation when skipFederatedStats is %s',
    (skipFederatedStats) => {
      const compiler = createCompiler();
      const extraOptions: NextFederationPluginExtraOptions = {
        skipFederatedStats,
      };

      applyClientPlugins(compiler, { ...options }, extraOptions);

      expect(ChunkCorrelationPlugin).toHaveBeenCalledWith({
        filename: [
          'static/chunks/federated-stats.json',
          'server/federated-stats.json',
        ],
      });
      expect(InvertedContainerPlugin).toHaveBeenCalledTimes(1);
    },
  );

  it('omits chunk correlation without affecting other client plugins', () => {
    const compiler = createCompiler();

    applyClientPlugins(compiler, { ...options }, { skipFederatedStats: true });

    expect(ChunkCorrelationPlugin).not.toHaveBeenCalled();
    expect(InvertedContainerPlugin).toHaveBeenCalledTimes(1);
  });
});
