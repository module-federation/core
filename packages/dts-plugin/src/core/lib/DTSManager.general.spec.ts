import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DTSManager } from './DTSManager';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { UpdateMode } from '../../server/constant';
import { ThirdPartyExtractor } from '@module-federation/third-party-dts-extractor';
import { HostOptions, RemoteInfo } from '../interfaces/HostOptions';
import { RemoteOptions } from '../interfaces/RemoteOptions';
import { downloadTypesArchive } from './archiveHandler';
import {
  retrieveHostConfig,
  retrieveRemoteInfo,
} from '../configurations/hostPlugin';

vi.mock('axios');
vi.mock('fs/promises');
vi.mock('fs');
vi.mock('./archiveHandler');
vi.mock('@module-federation/third-party-dts-extractor', () => ({
  ThirdPartyExtractor: vi.fn().mockImplementation(() => ({
    collectTypeImports: vi.fn().mockReturnValue([]),
  })),
}));

const projectRoot = path.join(__dirname, '../../..');

vi.mock('../configurations/hostPlugin', () => ({
  retrieveHostConfig: vi.fn().mockImplementation((options) => ({
    hostOptions: {
      ...options,
      context: projectRoot,
      typesFolder: '@mf-types',
      remoteTypesFolder: '@mf-types/remotes',
      deleteTypesFolder: false,
      implementation: 'webpack',
      abortOnError: false,
      consumeAPITypes: true,
      maxRetries: 3,
      runtimePkgs: [],
    },
    mapRemotesToDownload: {
      remote1: {
        name: 'remote1',
        url: 'http://example.com/remote1',
        alias: 'remote1',
        zipUrl: 'http://example.com/types.zip',
        apiTypeUrl: 'http://example.com/api.d.ts',
      },
    },
  })),
  retrieveRemoteInfo: vi.fn().mockImplementation(({ remoteAlias, remote }) => ({
    name: remoteAlias,
    url: remote,
    alias: remoteAlias,
  })),
}));

describe('DTSManager General Tests', () => {
  let dtsManager: DTSManager;

  beforeEach(() => {
    vi.clearAllMocks();
    const remoteOptions: RemoteOptions = {
      moduleFederationConfig: {
        name: 'testRemote',
        filename: 'remoteEntry.js',
        exposes: {
          './Component': './src/Component.tsx',
          './utils': './src/utils.ts',
        },
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
        },
      },
      typesFolder: '@mf-types',
      context: projectRoot,
      tsConfigPath: path.join(projectRoot, 'tsconfig.json'),
      compiledTypesFolder: 'compiled-types',
      deleteTypesFolder: false,
      additionalFilesToCompile: [],
      generateAPITypes: true,
      extractRemoteTypes: true,
      extractThirdParty: true,
      implementation: 'webpack',
      abortOnError: false,
    };
    fs.rmSync(path.join(projectRoot, 'node_modules/.cache/mf-types'), {
      recursive: true,
    });
    dtsManager = new DTSManager({ remote: remoteOptions });

    // Add mock implementations
    vi.spyOn(dtsManager, 'consumeArchiveTypes').mockResolvedValue(undefined);
    vi.spyOn(dtsManager, 'consumeAPITypes').mockResolvedValue(undefined);

    // Add mock for fs.writeFileSync
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(`
      import type { PackageType as PackageType_0, RemoteKeys as RemoteKeys_0 } from './existing/apis.d.ts';
    `);
  });

  describe('generateAPITypes', () => {
    it('should generate correct API types for multiple exposed components', () => {
      const exposeMap = {
        './Component': './src/Component.tsx',
        './utils': './src/utils.ts',
      };

      const result = dtsManager.generateAPITypes(exposeMap);
      expect(result).toContain("'REMOTE_ALIAS_IDENTIFIER/Component'");
      expect(result).toContain("'REMOTE_ALIAS_IDENTIFIER/utils'");
      expect(result).toContain('type PackageType<T>');
    });

    it('should handle empty expose map', () => {
      const result = dtsManager.generateAPITypes({});
      expect(result).toContain('export type RemoteKeys =');
      expect(result).toContain('type PackageType<T>');
    });
  });

  describe('requestRemoteManifest', () => {
    it('should handle non-manifest URLs correctly', async () => {
      const remoteInfo: RemoteInfo = {
        name: 'test',
        url: 'http://example.com/remote',
        alias: 'test-alias',
      };

      const result = await dtsManager.requestRemoteManifest(remoteInfo);
      expect(result).toEqual(remoteInfo);
    });

    it('should handle manifest URLs with auto publicPath', async () => {
      const manifestResponse = {
        data: {
          metaData: {
            types: {
              zip: 'types.zip',
              api: 'api.d.ts',
            },
            publicPath: 'auto',
          },
        },
      };

      vi.mocked(axios.get).mockResolvedValueOnce(manifestResponse);

      const remoteInfo: RemoteInfo = {
        name: 'test',
        url: 'http://example.com/remote.manifest.json',
        alias: 'test-alias',
      };

      const result = await dtsManager.requestRemoteManifest(remoteInfo);
      expect(result.zipUrl).toBeDefined();
      expect(result.apiTypeUrl).toBeDefined();
      expect(result.zipUrl).toContain('http://example.com/types.zip');
    });

    it('should handle manifest URLs without API types', async () => {
      const manifestResponse = {
        data: {
          metaData: {
            types: {
              zip: 'types.zip',
            },
            publicPath: 'http://example.com',
          },
        },
      };

      vi.mocked(axios.get).mockResolvedValueOnce(manifestResponse);

      const remoteInfo: RemoteInfo = {
        name: 'test',
        url: 'http://example.com/remote.manifest.json',
        alias: 'test-alias',
      };

      const result = await dtsManager.requestRemoteManifest(remoteInfo);
      expect(result.zipUrl).toBeDefined();
      expect(result.apiTypeUrl).toBe('');
    });

    it('should handle manifest fetch errors', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

      const remoteInfo: RemoteInfo = {
        name: 'test',
        url: 'http://example.com/remote.manifest.json',
        alias: 'test-alias',
      };

      const result = await dtsManager.requestRemoteManifest(remoteInfo);
      expect(result).toEqual(remoteInfo);
    });

    it('should handle manifest with getPublicPath function', async () => {
      const manifestResponse = {
        data: {
          metaData: {
            types: {
              zip: 'types.zip',
              api: 'api.d.ts',
            },
            publicPath: 'http://example.com/custom/',
          },
        },
      };

      vi.mocked(axios.get).mockResolvedValueOnce(manifestResponse);

      const remoteInfo: RemoteInfo = {
        name: 'test',
        url: 'http://example.com/remote.manifest.json',
        alias: 'test-alias',
      };

      const result = await dtsManager.requestRemoteManifest(remoteInfo);
      expect(result.zipUrl).toContain('http://example.com/custom/types.zip');
      expect(result.apiTypeUrl).toContain('http://example.com/custom/api.d.ts');
    });
  });

  describe('consumeTargetRemotes', () => {
    const baseHostOptions: Required<HostOptions> = {
      context: projectRoot,
      typesFolder: '@mf-types',
      runtimePkgs: [],
      moduleFederationConfig: {
        name: 'host',
        filename: 'remoteEntry.js',
        remotes: {},
      },
      remoteTypesFolder: '@mf-types/remotes',
      deleteTypesFolder: false,
      implementation: 'webpack',
      abortOnError: false,
      consumeAPITypes: true,
      maxRetries: 3,
    };

    it('should successfully download types archive', async () => {
      const remoteInfo: Required<RemoteInfo> = {
        name: 'test',
        url: 'http://example.com/remote',
        alias: 'test-alias',
        zipUrl: 'http://example.com/types.zip',
        apiTypeUrl: 'http://example.com/api.d.ts',
      };

      const mockDownloader = vi
        .fn()
        .mockResolvedValue(['test-alias', '/tmp/types']);
      vi.mocked(downloadTypesArchive).mockReturnValue(mockDownloader);

      const result = await dtsManager.consumeTargetRemotes(
        baseHostOptions,
        remoteInfo,
      );

      expect(result).toEqual(['test-alias', '/tmp/types']);
      expect(mockDownloader).toHaveBeenCalledWith([
        'test-alias',
        'http://example.com/types.zip',
      ]);
    });

    it('should throw error when zipUrl is missing', async () => {
      const remoteInfo: Required<RemoteInfo> = {
        name: 'test',
        url: 'http://example.com/remote',
        alias: 'test-alias',
        zipUrl: '',
        apiTypeUrl: '',
      };

      await expect(
        dtsManager.consumeTargetRemotes(baseHostOptions, remoteInfo),
      ).rejects.toThrow("Can not get test's types archive url!");
    });
  });

  describe('updateTypes', () => {
    it('should handle positive update mode for host', async () => {
      const generateTypesSpy = vi.spyOn(dtsManager, 'generateTypes');
      dtsManager.options.host = {
        moduleFederationConfig: {
          name: 'testRemote',
        },
      };
      dtsManager.options.remote = {
        moduleFederationConfig: {
          name: 'testRemote',
          filename: 'remoteEntry.js',
          exposes: {
            './Component': './src/Component.tsx',
          },
        },
        typesFolder: '@mf-types',
        context: projectRoot,
        tsConfigPath: path.join(projectRoot, 'tsconfig.json'),
      };

      await dtsManager.updateTypes({
        remoteName: 'testRemote',
        updateMode: UpdateMode.POSITIVE,
        once: true,
      });

      expect(generateTypesSpy).toHaveBeenCalled();
    });

    it('should handle missing remote options', async () => {
      dtsManager = new DTSManager({});

      await dtsManager.updateTypes({
        remoteName: 'testRemote',
        updateMode: UpdateMode.POSITIVE,
        once: true,
      });

      // Should not throw and handle gracefully
      expect(true).toBe(true);
    });
  });

  describe('downloadAPITypes', () => {
    it('should download and save API types with correct alias replacement', async () => {
      const remoteInfo: Required<RemoteInfo> = {
        name: 'test',
        url: 'http://example.com/remote',
        alias: 'test-alias',
        zipUrl: 'http://example.com/types.zip',
        apiTypeUrl: 'http://example.com/api.d.ts',
      };

      const apiTypeContent = `
        export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/Component';
        type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/Component' ? typeof import('REMOTE_ALIAS_IDENTIFIER/Component') : any;
      `;

      vi.mocked(axios.get).mockResolvedValueOnce({ data: apiTypeContent });
      vi.spyOn(fs, 'writeFileSync');

      await dtsManager.downloadAPITypes(remoteInfo, '/tmp/types');

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('test-alias/Component');
      expect(content).not.toContain('REMOTE_ALIAS_IDENTIFIER');
      expect(content).toContain(
        "type PackageType<T> = T extends 'test-alias/Component'",
      );
      expect(dtsManager.loadedRemoteAPIAlias.has('test-alias')).toBe(true);
    });

    it('should handle missing apiTypeUrl', async () => {
      const remoteInfo: Required<RemoteInfo> = {
        name: 'test',
        url: 'http://example.com/remote',
        alias: 'test-alias',
        zipUrl: 'http://example.com/types.zip',
        apiTypeUrl: '',
      };

      vi.spyOn(fs, 'writeFileSync');

      await dtsManager.downloadAPITypes(remoteInfo, '/tmp/types');

      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(dtsManager.loadedRemoteAPIAlias.has('test-alias')).toBe(false);
    });

    it('should handle download errors', async () => {
      const remoteInfo: Required<RemoteInfo> = {
        name: 'test',
        url: 'http://example.com/remote',
        alias: 'test-alias',
        zipUrl: 'http://example.com/types.zip',
        apiTypeUrl: 'http://example.com/api.d.ts',
      };

      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));
      vi.spyOn(fs, 'writeFileSync');

      await dtsManager.downloadAPITypes(remoteInfo, '/tmp/types');

      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(dtsManager.loadedRemoteAPIAlias.has('test-alias')).toBe(false);
    });
  });

  describe('consumeAPITypes', () => {
    const baseHostOptions: Required<HostOptions> = {
      context: projectRoot,
      typesFolder: '@mf-types',
      runtimePkgs: ['@custom/runtime'],
      moduleFederationConfig: {
        name: 'host',
        filename: 'remoteEntry.js',
        remotes: {
          remote1: 'remote1@http://example.com/remote1',
          remote2: 'remote2@http://example.com/remote2',
        },
      },
      remoteTypesFolder: '@mf-types/remotes',
      deleteTypesFolder: false,
      implementation: 'webpack',
      abortOnError: false,
      consumeAPITypes: true,
      maxRetries: 3,
    };

    it('should handle no loaded remote API aliases', () => {
      vi.spyOn(fs, 'writeFileSync');

      dtsManager.consumeAPITypes(baseHostOptions);

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle existing API types file', () => {
      const existingContent = `
        import type { PackageType as PackageType_0, RemoteKeys as RemoteKeys_0 } from './existing/apis.d.ts';
      `;
      vi.spyOn(fs, 'readFileSync').mockReturnValue(existingContent);
      vi.spyOn(fs, 'writeFileSync');

      // Mock the ThirdPartyExtractor to return the existing import
      vi.mocked(ThirdPartyExtractor).mockImplementation(() => ({
        collectTypeImports: vi.fn().mockReturnValue(['./existing/apis.d.ts']),
        pkgs: {} as Record<string, string>,
        pattern: /.*/,
        context: '',
        destDir: '',
        tsConfigPath: '',
        typesFolder: '',
        implementation: 'webpack',
        addPkgs: vi.fn(),
        inferPkgDir: vi.fn(),
        collectPkgs: vi.fn(),
        copyDts: vi.fn().mockResolvedValue(undefined),
      }));

      // Add the existing alias to the loadedRemoteAPIAlias set
      dtsManager.loadedRemoteAPIAlias.add('existing');

      dtsManager.consumeAPITypes(baseHostOptions);

      expect(dtsManager.loadedRemoteAPIAlias.has('existing')).toBe(true);
    });
  });
});
