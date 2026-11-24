/** @jest-environment node */
import type { Stats } from '@module-federation/sdk';
import type { Compilation, Compiler } from 'webpack';
import { ManifestManager } from '../src/ManifestManager';

function generate(
  service: Partial<Stats['exposes'][number]>,
  serviceBaseUrl?: string,
) {
  const manager = new ManifestManager();
  manager.init({ name: 'weather' });
  return manager.generateManifest({
    compiler: { options: {} } as Compiler,
    compilation: {} as Compilation,
    publicPath: 'https://cdn.example.test/',
    bundler: 'webpack',
    stats: {
      id: 'weather',
      name: 'weather',
      metaData: {
        name: 'weather',
        globalName: 'weather',
        type: 'app',
        buildInfo: { buildVersion: 'build-1', buildName: 'weather' },
        remoteEntry: { name: 'remoteEntry.js', path: '', type: 'global' },
        publicPath: 'https://cdn.example.test/',
        ...(serviceBaseUrl !== undefined && { serviceBaseUrl }),
      },
      exposes: [
        {
          id: 'weather:App',
          name: 'App',
          path: './App',
          file: './App.tsx',
          requires: [],
          assets: { js: { sync: [], async: [] }, css: { sync: [], async: [] } },
          render: 'bridge',
          isService: true,
          ...service,
        },
      ],
      shared: [],
      remotes: [],
    },
  });
}

describe('Service manifest publication', () => {
  it('publishes a service endpoint without the build-only declaration', () => {
    const manifest = generate(
      { servicePath: 'render/App' },
      'https://render.example.test/base/',
    );
    expect(manifest.metaData.serviceBaseUrl).toBe(
      'https://render.example.test/base/',
    );
    expect(manifest.exposes[0]).toMatchObject({
      render: 'bridge',
      servicePath: 'render/App',
    });
    expect(manifest.exposes[0]).not.toHaveProperty('isService');
  });

  it.each([
    [{}, 'https://render.example.test/'],
    [{ servicePath: '' }, 'https://render.example.test/'],
    [
      { isService: false, servicePath: undefined },
      'https://render.example.test/',
    ],
    [{ servicePath: 'render/App' }, undefined],
    [
      { servicePath: '//other.example.test/render' },
      'https://render.example.test/',
    ],
    [
      { servicePath: 'render/App', render: 'component' },
      'https://render.example.test/',
    ],
  ] as const)(
    'fails publication of an incomplete Service instead of making it ordinary',
    (service, base) => {
      expect(() => generate(service, base)).toThrow(/Service expose App/);
    },
  );
});
