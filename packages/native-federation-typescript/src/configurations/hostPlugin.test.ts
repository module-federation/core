import { describe, expect, it } from 'vitest';

import { retrieveHostConfig } from './hostPlugin';

describe('hostPlugin', () => {
  const moduleFederationConfig = {
    name: 'moduleFederationHost',
    filename: 'remoteEntry.js',
    remotes: {
      moduleFederationTypescript: 'http://localhost:3000/remoteEntry.js',
    },
    shared: {
      react: { singleton: true, eager: true },
      'react-dom': { singleton: true, eager: true },
    },
  };

  describe('retrieveHostConfig', () => {
    it('throws for missing module federation configuration', () => {
      // @ts-expect-error Missing module federation configuration
      const invokeRetrieve = () => retrieveHostConfig({});
      expect(invokeRetrieve).toThrowError('moduleFederationConfig is required');
    });

    describe('correctly intersect with default options', () => {
      it('only moduleFederationConfig provided', () => {
        const { hostOptions, mapRemotesToDownload } = retrieveHostConfig({
          moduleFederationConfig,
        });

        expect(hostOptions).toStrictEqual({
          moduleFederationConfig,
          typesFolder: '@mf-types',
          deleteTypesFolder: true,
          maxRetries: 3,
        });

        expect(mapRemotesToDownload).toStrictEqual({
          moduleFederationTypescript: 'http://localhost:3000/@mf-types.zip',
        });
      });

      it('all options provided', () => {
        const options = {
          moduleFederationConfig,
          typesFolder: 'custom-types',
          deleteTypesFolder: false,
          maxRetries: 1,
        };

        const { hostOptions, mapRemotesToDownload } =
          retrieveHostConfig(options);

        expect(hostOptions).toStrictEqual(options);

        expect(mapRemotesToDownload).toStrictEqual({
          moduleFederationTypescript: 'http://localhost:3000/custom-types.zip',
        });
      });
    });

    it('correctly resolve subpath remotes', () => {
      const subpathModuleFederationConfig = {
        ...moduleFederationConfig,
        remotes: {
          moduleFederationTypescript:
            'http://localhost:3000/subpatha/subpathb/remoteEntry.js',
        },
      };

      const { mapRemotesToDownload } = retrieveHostConfig({
        moduleFederationConfig: subpathModuleFederationConfig,
      });

      expect(mapRemotesToDownload).toStrictEqual({
        moduleFederationTypescript:
          'http://localhost:3000/subpatha/subpathb/@mf-types.zip',
      });
    });

    it('correctly resolve remotes with relative reference in place of absolute url', () => {
      const subpathModuleFederationConfig = {
        ...moduleFederationConfig,
        remotes: {
          moduleFederationTypescript: '/subpatha/remoteEntry.js',
        },
      };

      const { mapRemotesToDownload } = retrieveHostConfig({
        moduleFederationConfig: subpathModuleFederationConfig,
      });

      expect(mapRemotesToDownload).toStrictEqual({
        moduleFederationTypescript: '/subpatha/@mf-types.zip',
      });
    });
  });
});
