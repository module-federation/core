import {
  applyRscManifestMetadata,
  buildClientComponentsFromClientManifest,
  buildClientComponentsFromSsrManifest,
  inferRscLayer,
} from '../src/rscManifestMetadata';

describe('rscManifestMetadata', () => {
  describe('inferRscLayer', () => {
    it('returns rsc when react-server condition is present', () => {
      expect(
        inferRscLayer({ options: { target: 'web' } } as any, ['react-server']),
      ).toBe('rsc');
    });

    it('returns ssr for async-node targets', () => {
      expect(inferRscLayer({ options: { target: 'async-node' } } as any)).toBe(
        'ssr',
      );
    });

    it('defaults to client otherwise', () => {
      expect(inferRscLayer({ options: { target: 'web' } } as any)).toBe(
        'client',
      );
    });
  });

  describe('buildClientComponentsFromClientManifest', () => {
    it('normalizes requests and file URLs', () => {
      const clientManifest = {
        'file:///abs/path/A.js': {
          id: '(client)/./src/A.js',
          chunks: ['main.js'],
          name: 'default',
        },
        'file:///abs/path/B.js': {
          id: '(client)/src/B.js',
          chunks: [],
          name: '*',
        },
      };

      const registry = buildClientComponentsFromClientManifest(clientManifest);

      expect(registry['(client)/./src/A.js']).toMatchObject({
        moduleId: '(client)/./src/A.js',
        request: './src/A.js',
        ssrRequest: '(ssr)/./src/A.js',
        exports: ['default'],
        chunks: ['main.js'],
        filePath: '/abs/path/A.js',
      });

      expect(registry['(client)/src/B.js']).toMatchObject({
        moduleId: '(client)/src/B.js',
        request: './src/B.js',
        ssrRequest: '(ssr)/src/B.js',
        exports: ['*'],
        chunks: [],
        filePath: '/abs/path/B.js',
      });
    });
  });

  describe('buildClientComponentsFromSsrManifest', () => {
    it('derives exports and file paths from moduleMap', () => {
      const ssrManifest = {
        moduleMap: {
          '(client)/./src/A.js': {
            default: { specifier: 'file:///abs/path/A.js' },
            '*': { specifier: 'file:///abs/path/A.js' },
          },
        },
      };

      const registry = buildClientComponentsFromSsrManifest(ssrManifest);

      expect(registry['(client)/./src/A.js']).toMatchObject({
        moduleId: '(client)/./src/A.js',
        request: '(ssr)/./src/A.js',
        ssrRequest: '(ssr)/./src/A.js',
        exports: ['default', '*'],
        chunks: [],
        filePath: '/abs/path/A.js',
      });
    });
  });

  describe('applyRscManifestMetadata', () => {
    it('attaches additionalData.rsc and mirrors to stats.rsc', () => {
      const compilation = {
        getAsset: (name: string) =>
          name === 'react-client-manifest.json'
            ? {
                source: {
                  source: () =>
                    JSON.stringify({
                      'file:///abs/path/A.js': {
                        id: '(client)/./src/A.js',
                        chunks: ['main.js'],
                        name: 'default',
                      },
                    }),
                },
              }
            : undefined,
      };

      const compiler = {
        options: { target: 'web', resolve: { conditionNames: ['browser'] } },
      };

      const stats: any = { id: 'x', name: 'app' };

      const out = applyRscManifestMetadata({
        stats,
        compiler: compiler as any,
        compilation,
        rscOptions: { layer: 'client', shareScope: 'client', isRSC: false },
      });

      expect(out.additionalData?.rsc?.layer).toBe('client');
      expect(out.additionalData?.rsc?.shareScope).toBe('client');
      expect(out.additionalData?.rsc?.isRSC).toBe(false);
      expect(out.additionalData?.rsc?.clientComponents).toBeDefined();
      expect(out.rsc).toBe(out.additionalData.rsc);
    });

    it('falls back to react-ssr-manifest.json when client manifest is missing', () => {
      const compilation = {
        getAsset: (name: string) =>
          name === 'react-ssr-manifest.json'
            ? {
                source: {
                  source: () =>
                    JSON.stringify({
                      moduleMap: {
                        '(client)/./src/A.js': {
                          default: { specifier: 'file:///abs/path/A.js' },
                        },
                      },
                    }),
                },
              }
            : undefined,
      };

      const compiler = {
        options: {
          target: 'async-node',
          resolve: { conditionNames: ['node'] },
        },
      };

      const stats: any = { id: 'x', name: 'app' };

      const out = applyRscManifestMetadata({
        stats,
        compiler: compiler as any,
        compilation,
        rscOptions: { shareScope: 'client' },
      });

      expect(out.additionalData?.rsc?.layer).toBe('ssr');
      expect(out.additionalData?.rsc?.clientComponents).toBeDefined();
      expect(
        out.additionalData.rsc.clientComponents['(client)/./src/A.js'],
      ).toMatchObject({ request: '(ssr)/./src/A.js' });
    });

    it('does not auto-populate clientComponents for the rsc layer', () => {
      const compilation = {
        getAsset: () => ({
          source: { source: () => JSON.stringify({}) },
        }),
      };

      const compiler = {
        options: {
          target: 'async-node',
          resolve: { conditionNames: ['react-server'] },
        },
      };

      const stats: any = { id: 'x', name: 'app' };

      const out = applyRscManifestMetadata({
        stats,
        compiler: compiler as any,
        compilation,
        rscOptions: { layer: 'rsc', shareScope: 'rsc', isRSC: true },
      });

      expect(out.additionalData?.rsc?.layer).toBe('rsc');
      expect(out.additionalData?.rsc?.isRSC).toBe(true);
      expect(out.additionalData?.rsc?.clientComponents).toBeUndefined();
    });

    it('merges existing clientComponents with computed ones', () => {
      const compilation = {
        getAsset: (name: string) =>
          name === 'react-client-manifest.json'
            ? {
                source: {
                  source: () =>
                    JSON.stringify({
                      'file:///abs/path/New.js': {
                        id: '(client)/./src/New.js',
                        chunks: [],
                        name: 'default',
                      },
                    }),
                },
              }
            : undefined,
      };

      const compiler = { options: { target: 'web' } };

      const stats: any = {
        id: 'x',
        name: 'app',
        additionalData: {
          rsc: {
            layer: 'client',
            shareScope: 'client',
            clientComponents: {
              existing: { moduleId: 'existing' },
            },
          },
        },
      };

      const out = applyRscManifestMetadata({
        stats,
        compiler: compiler as any,
        compilation,
        rscOptions: { layer: 'client', shareScope: 'client' },
      });

      expect(out.additionalData.rsc.clientComponents).toMatchObject({
        existing: { moduleId: 'existing' },
        '(client)/./src/New.js': { moduleId: '(client)/./src/New.js' },
      });
    });
  });
});
