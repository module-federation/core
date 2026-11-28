import legacyFederation from '@module-federation/webpack-bundler-runtime';
import { createFederation } from '@module-federation/webpack-bundler-runtime/compose';
import { container } from '@module-federation/webpack-bundler-runtime/adapters/container';
import { shareScope } from '@module-federation/webpack-bundler-runtime/adapters/share-scope';
import { createContainerCode } from '../createContainerTemplate';

const instantiate = (federation: unknown, name: string) => {
  const createContainer = new Function(
    'bundler_runtime_base',
    `${createContainerCode.replace(/^import .*$/m, '')}\nreturn createContainer;`,
  )({ __esModule: true, default: federation });
  return createContainer({
    name,
    exposes: { './answer': () => ({ answer: 42 }) },
    remotes: [],
    shared: {},
  });
};

const getAnswer = async (entry: any) => {
  await entry.init({});
  const factory = await entry.get('./answer');
  return factory();
};

describe('createContainerCode', () => {
  it('initializes through bundlerRuntime.init with the composed bundler runtime', async () => {
    const federation = createFederation({
      buildId: 'esbuild-composed:1.0.0',
      capabilities: {},
      adapters: [container, shareScope],
    });

    await expect(
      getAnswer(instantiate(federation, 'esbuild_composed')),
    ).resolves.toEqual({ answer: 42 });
  });

  it('still initializes with the legacy bundler runtime', async () => {
    await expect(
      getAnswer(instantiate(legacyFederation, 'esbuild_legacy')),
    ).resolves.toEqual({ answer: 42 });
  });
});
