import type {
  StatsCompilation,
  StatsModule,
} from 'webpack/lib/stats/DefaultStatsFactoryPlugin';

jest.mock(
  '@module-federation/dts-plugin/core',
  () => ({
    isTSProject: () => false,
    retrieveTypesAssetsInfo: () => ({}) as const,
  }),
  { virtual: true },
);

import { getSharedModules } from '../src/utils';

describe('getSharedModules', () => {
  it('keys shared modules by share scope as well as package name', () => {
    const consumeDefault =
      'consume shared module (default) react@^18.0.0 (strict) (fallback: ./node_modules/react/index.js)';
    const consumeLegacy =
      'consume shared module (legacy) react@^17.0.0 (strict) (fallback: ./node_modules/react17/index.js)';
    const sharedModules = [
      { name: consumeDefault },
      { name: consumeLegacy },
    ] as StatsModule[];
    const stats = {
      modules: [
        { name: './node_modules/react/index.js', issuerName: consumeDefault },
        { name: './node_modules/react17/index.js', issuerName: consumeLegacy },
      ],
    } as StatsCompilation;

    const keys = getSharedModules(stats, sharedModules).map(([key]) => key);

    expect(new Set(keys).size).toBe(2);
  });
});
