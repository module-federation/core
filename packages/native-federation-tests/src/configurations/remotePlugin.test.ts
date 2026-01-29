import { describe, expect, it } from 'vitest';

import { retrieveRemoteConfig } from './remotePlugin';

describe('hostPlugin', () => {
  const moduleFederationConfig = {
    name: 'moduleFederationHost',
    filename: 'remoteEntry.js',
    exposes: {
      './button': './src/components/button',
      './anotherButton': './src/components/anotherButton',
    },
    shared: {
      react: { singleton: true, eager: true },
      'react-dom': { singleton: true, eager: true },
    },
  };

  describe('retrieveRemoteConfig', () => {
    it('throws for missing module federation configuration', () => {
      // @ts-expect-error Missing module federation configuration
      const invokeRetrieve = () => retrieveRemoteConfig({});
      expect(invokeRetrieve).toThrowError('moduleFederationConfig is required');
    });

    describe('correctly intersect with default options', () => {
      it('only moduleFederationConfig provided', () => {
        const { compiledFilesFolder, externalDeps, remoteOptions } =
          retrieveRemoteConfig({
            moduleFederationConfig,
          });

        expect(compiledFilesFolder).toBe('dist/@mf-tests');

        expect(externalDeps).toStrictEqual(['react', 'react-dom']);

        expect(remoteOptions).toStrictEqual({
          testsFolder: '@mf-tests',
          distFolder: './dist',
          deleteTestsFolder: true,
          moduleFederationConfig,
          additionalBundlerConfig: {},
        });
      });

      it('all options provided', () => {
        const { compiledFilesFolder, externalDeps, remoteOptions } =
          retrieveRemoteConfig({
            moduleFederationConfig,
            distFolder: 'distFolder',
            testsFolder: 'testsFolder',
            deleteTestsFolder: true,
            additionalBundlerConfig: {
              format: 'cjs',
            },
          });

        expect(compiledFilesFolder).toBe('distFolder/testsFolder');

        expect(externalDeps).toStrictEqual(['react', 'react-dom']);

        expect(remoteOptions).toStrictEqual({
          testsFolder: 'testsFolder',
          distFolder: 'distFolder',
          deleteTestsFolder: true,
          moduleFederationConfig,
          additionalBundlerConfig: {
            format: 'cjs',
          },
        });
      });
    });
  });
});
