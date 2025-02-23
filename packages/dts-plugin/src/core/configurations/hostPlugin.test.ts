import { describe, expect, it } from 'vitest';
import path from 'path';

import { retrieveHostConfig } from './hostPlugin';
import { retrieveTypesArchiveDestinationPath } from '../lib/archiveHandler';

describe('hostPlugin', () => {
  const moduleFederationConfig = {
    name: 'hostPluginTestHost',
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
          remoteTypesFolder: '@mf-types',
          deleteTypesFolder: true,
          maxRetries: 3,
          implementation: '',
          context: process.cwd(),
          abortOnError: true,
          consumeAPITypes: false,
          runtimePkgs: [],
          remoteTypeUrls: {},
        });

        expect(mapRemotesToDownload).toStrictEqual({
          moduleFederationTypescript: {
            alias: 'moduleFederationTypescript',
            apiTypeUrl: 'http://localhost:3000/@mf-types.d.ts',
            name: 'http://localhost:3000/remoteEntry.js',
            url: 'http://localhost:3000/remoteEntry.js',
            zipUrl: 'http://localhost:3000/@mf-types.zip',
          },
        });
      });

      it('all options provided', () => {
        const options = {
          moduleFederationConfig,
          typesFolder: 'custom-types',
          remoteTypesFolder: '@remote-mf-types',
          deleteTypesFolder: false,
          maxRetries: 1,
          implementation: '',
          context: process.cwd(),
          abortOnError: true,
          consumeAPITypes: false,
          runtimePkgs: [],
          remoteTypeUrls: {},
        };

        const { hostOptions, mapRemotesToDownload } =
          retrieveHostConfig(options);

        expect(hostOptions).toStrictEqual(options);

        expect(mapRemotesToDownload).toStrictEqual({
          moduleFederationTypescript: {
            alias: 'moduleFederationTypescript',
            apiTypeUrl: 'http://localhost:3000/@remote-mf-types.d.ts',
            name: 'http://localhost:3000/remoteEntry.js',
            url: 'http://localhost:3000/remoteEntry.js',
            zipUrl: 'http://localhost:3000/@remote-mf-types.zip',
          },
        });

        const destinationPath = path.resolve(
          hostOptions.context,
          hostOptions.typesFolder,
          'moduleFederationTypescript',
        );
        expect(
          retrieveTypesArchiveDestinationPath(
            hostOptions,
            'moduleFederationTypescript',
          ),
        ).toStrictEqual(destinationPath);
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
        moduleFederationTypescript: {
          alias: 'moduleFederationTypescript',
          apiTypeUrl: 'http://localhost:3000/subpatha/subpathb/@mf-types.d.ts',
          name: 'http://localhost:3000/subpatha/subpathb/remoteEntry.js',
          url: 'http://localhost:3000/subpatha/subpathb/remoteEntry.js',
          zipUrl: 'http://localhost:3000/subpatha/subpathb/@mf-types.zip',
        },
      });
    });

    it('correctly resolve remotes with relative reference in place of absolute url', () => {
      const subpathModuleFederationConfig = {
        ...moduleFederationConfig,
        remotes: {
          moduleFederationTypescript: '/subpatha/mf-manifest.json',
        },
      };

      const { mapRemotesToDownload } = retrieveHostConfig({
        moduleFederationConfig: subpathModuleFederationConfig,
      });

      expect(mapRemotesToDownload).toStrictEqual({
        moduleFederationTypescript: {
          alias: 'moduleFederationTypescript',
          apiTypeUrl: '/subpatha/@mf-types.d.ts',
          name: '/subpatha/mf-manifest.json',
          url: '/subpatha/mf-manifest.json',
          zipUrl: '/subpatha/@mf-types.zip',
        },
      });
    });
  });
});
