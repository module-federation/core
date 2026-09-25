import { checkFederationGraph } from '../../src/composition/checkFederationGraph';
import type { RuntimeFamily } from '../../src/composition/family';

const CORE = '@module-federation/runtime-core';
const family: RuntimeFamily = {
  anchor: '/app',
  members: {
    [CORE]: {
      name: CORE,
      root: '/nm/core',
      exports: {},
      resolvedFrom: '/nm/runtime',
    },
  },
};
const core = (file: string) => ({
  type: 'javascript/esm',
  resource: `/nm/core/dist/${file}`,
  package: { name: CORE, root: '/nm/core' },
});

describe('checkFederationGraph', () => {
  it('reports nothing for a composed graph with every adapter', () => {
    expect(
      checkFederationGraph({
        modules: [
          { type: 'remote-module' },
          { type: 'provide-module' },
          core('remote.js'),
        ],
        externalRequests: ['react'],
        family,
        composed: { adapters: ['remotes', 'share-scope'], bootstraps: 1 },
      }),
    ).toEqual({ errors: [], warnings: [] });
  });

  it.each([
    ['remote-module', 'remotes'],
    ['consume-shared-module', 'consumes'],
    ['provide-module', 'share-scope'],
    ['container-entry', 'container'],
  ])('errors on a %s without the %s adapter', (type, adapter) => {
    const { errors, warnings } = checkFederationGraph({
      modules: [{ type }, { type }],
      externalRequests: [],
      composed: { adapters: [], bootstraps: 1 },
    });
    expect(errors).toEqual([expect.stringContaining(`"${adapter}" adapter`)]);
    expect(warnings).toEqual([]);
  });

  it('does not check adapters in legacy mode', () => {
    expect(
      checkFederationGraph({
        modules: [{ type: 'remote-module' }],
        externalRequests: [CORE],
      }),
    ).toEqual({ errors: [], warnings: [] });
  });

  it('errors on an external runtime package in composed mode', () => {
    const { errors } = checkFederationGraph({
      modules: [],
      externalRequests: ['@module-federation/runtime/compose', 'react'],
      composed: { adapters: [], bootstraps: 1 },
    });
    expect(errors).toEqual([
      expect.stringContaining(
        '"@module-federation/runtime/compose" is external',
      ),
    ]);
  });

  it('warns on two bootstraps and errors when an adapter is also missing', () => {
    expect(
      checkFederationGraph({
        modules: [],
        externalRequests: [],
        composed: { adapters: [], bootstraps: 2 },
      }),
    ).toEqual({
      errors: [],
      warnings: [expect.stringContaining('2 federation bootstraps')],
    });

    const { errors, warnings } = checkFederationGraph({
      modules: [{ type: 'remote-module' }],
      externalRequests: [],
      composed: { adapters: [], bootstraps: 2 },
    });
    expect(errors).toEqual([
      expect.stringContaining('"remotes" adapter'),
      expect.stringContaining('2 federation bootstraps'),
    ]);
    expect(warnings).toEqual([]);
  });

  it('warns once on a runtime package resolved outside the family', () => {
    const other = { name: CORE, root: '/nm/other-core' };
    const { warnings, errors } = checkFederationGraph({
      modules: [
        core('remote.js'),
        {
          type: 'javascript/esm',
          resource: '/nm/other-core/dist/a.js',
          package: other,
        },
        {
          type: 'javascript/esm',
          resource: '/nm/other-core/dist/b.js',
          package: other,
        },
        {
          type: 'javascript/esm',
          resource: '/x/react.js',
          package: { name: 'react', root: '/x' },
        },
      ],
      externalRequests: [],
      family,
    });
    expect(errors).toEqual([]);
    expect(warnings).toEqual([
      expect.stringContaining(
        `${CORE} resolved to /nm/other-core, outside the runtime family at /nm/core`,
      ),
    ]);
  });

  it('warns when one runtime package is resolved as both .cjs and .js', () => {
    const { warnings } = checkFederationGraph({
      modules: [core('remote.js'), core('index.cjs'), core('shared.js')],
      externalRequests: [],
      family,
    });
    expect(warnings).toEqual([
      expect.stringContaining(
        `${CORE} at /nm/core is in the graph as both .cjs and .js`,
      ),
    ]);
  });
});
