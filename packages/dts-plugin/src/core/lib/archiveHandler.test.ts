import type { HostOptions } from '../interfaces/HostOptions';
import type { RemoteOptions } from '../interfaces/RemoteOptions';
import type { TsConfigJson } from '../interfaces/TsConfigJson';

import AdmZip from 'adm-zip';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { readJSONSync } from 'fs-extra';
import os from 'os';
import { join } from 'path';
import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  MockInstance,
} from 'vitest';

import {
  createTypesArchive,
  downloadTypesArchive,
  retrieveTypesArchiveDestinationPath,
  retrieveTypesZipPath,
} from './archiveHandler';
import { fileLog } from '../../server';

describe('archiveHandler', () => {
  const tmpDir = mkdtempSync(join(os.tmpdir(), 'archive-handler'));
  const basicConfig = readJSONSync(
    join(__dirname, '../../..', './tsconfig.spec.json'),
  ) as TsConfigJson;
  const tsConfig: TsConfigJson = {
    ...basicConfig,
    compilerOptions: {
      ...basicConfig.compilerOptions,
      outDir: join(tmpDir, 'typesRemoteFolder', 'compiledTypesFolder'),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up and recreate the output directory
    rmSync(tsConfig.compilerOptions.outDir, { recursive: true, force: true });
    mkdirSync(tsConfig.compilerOptions.outDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('retrieveTypesZipPath', () => {
    it('should correctly construct zip path', () => {
      const mfTypesPath = '/path/to/types/folder';
      const remoteOptions: Required<RemoteOptions> = {
        typesFolder: 'folder',
        moduleFederationConfig: {},
        context: process.cwd(),
        implementation: '',
        hostRemoteTypesFolder: 'remoteTypes',
        compileInChildProcess: false,
        compilerInstance: null,
        generateAPITypes: false,
        extractThirdParty: false,
        extractRemoteTypes: false,
        abortOnError: true,
        additionalFilesToCompile: [],
        compiledTypesFolder: 'compiledTypesFolder',
        tsConfigPath: './tsconfig.spec.json',
        deleteTypesFolder: false,
      };

      const zipPath = retrieveTypesZipPath(mfTypesPath, remoteOptions);
      expect(zipPath).toBe('/path/to/types/folder.zip');
    });

    it('should handle paths with trailing slashes', () => {
      const mfTypesPath = '/path/to/types/folder/';
      const remoteOptions: Required<RemoteOptions> = {
        typesFolder: 'folder',
        moduleFederationConfig: {},
        context: process.cwd(),
        implementation: '',
        hostRemoteTypesFolder: 'remoteTypes',
        compileInChildProcess: false,
        compilerInstance: null,
        generateAPITypes: false,
        extractThirdParty: false,
        extractRemoteTypes: false,
        abortOnError: true,
        additionalFilesToCompile: [],
        compiledTypesFolder: 'compiledTypesFolder',
        tsConfigPath: './tsconfig.spec.json',
        deleteTypesFolder: false,
      };

      const zipPath = retrieveTypesZipPath(mfTypesPath, remoteOptions);
      expect(zipPath).toBe('/path/to/types/folder.zip');
    });

    it('should handle paths with multiple levels', () => {
      const hostOptions: Required<HostOptions> = {
        context: '/base/path',
        typesFolder: 'types/nested',
        moduleFederationConfig: {},
        implementation: '',
        runtimePkgs: [],
        abortOnError: true,
        remoteTypesFolder: 'remoteTypes',
        deleteTypesFolder: false,
        maxRetries: 3,
        consumeAPITypes: false,
      };

      const path = retrieveTypesArchiveDestinationPath(
        hostOptions,
        'remote1/v1',
      );
      expect(path).toBe('/base/path/types/nested/remote1/v1');
    });
  });

  describe('retrieveTypesArchiveDestinationPath', () => {
    it('should correctly construct destination path', () => {
      const hostOptions: Required<HostOptions> = {
        context: '/base',
        typesFolder: 'types',
        moduleFederationConfig: {},
        implementation: '',
        runtimePkgs: [],
        abortOnError: true,
        remoteTypesFolder: 'remoteTypes',
        deleteTypesFolder: false,
        maxRetries: 3,
        consumeAPITypes: false,
      };

      const path = retrieveTypesArchiveDestinationPath(hostOptions, 'remote1');
      expect(path).toBe('/base/types/remote1');
    });
  });

  describe('createTypesArchive', () => {
    const remoteOptions: Required<RemoteOptions> = {
      additionalFilesToCompile: [],
      compiledTypesFolder: 'compiledTypesFolder',
      typesFolder: 'typesRemoteFolder',
      moduleFederationConfig: {},
      tsConfigPath: './tsconfig.spec.json',
      deleteTypesFolder: false,
      context: process.cwd(),
      implementation: '',
      hostRemoteTypesFolder: 'remoteTypes',
      compileInChildProcess: false,
      compilerInstance: null,
      generateAPITypes: false,
      extractThirdParty: false,
      extractRemoteTypes: false,
      abortOnError: true,
    };

    it('should correctly create archive with type definitions', async () => {
      // Create a sample type definition file
      const typePath = join(tsConfig.compilerOptions.outDir, 'sample.d.ts');
      writeFileSync(typePath, 'export declare const foo: string;');

      const archivePath = join(tmpDir, `${remoteOptions.typesFolder}.zip`);
      const archiveCreated = await createTypesArchive(tsConfig, remoteOptions);

      expect(archiveCreated).toBeTruthy();
      expect(existsSync(archivePath)).toBeTruthy();

      // Verify archive contents - only check .d.ts files
      const zip = new AdmZip(archivePath);
      const dtsEntries = zip
        .getEntries()
        .filter((entry) => entry.entryName.endsWith('.d.ts'));
      expect(dtsEntries).toHaveLength(1);
      // The entry name includes the compiledTypesFolder since that's how it's stored in the archive
      expect(dtsEntries[0].entryName).toBe('compiledTypesFolder/sample.d.ts');
      expect(dtsEntries[0].getData().toString()).toBe(
        'export declare const foo: string;',
      );
    });

    it('should throw error for non-existent outDir', async () => {
      const invalidConfig: TsConfigJson = {
        ...tsConfig,
        compilerOptions: {
          ...tsConfig.compilerOptions,
          outDir: '/foo',
        },
      };

      await expect(
        createTypesArchive(invalidConfig, remoteOptions),
      ).rejects.toThrowError();
    });

    it('should handle empty type definitions directory', async () => {
      const archivePath = join(tmpDir, `${remoteOptions.typesFolder}.zip`);
      const archiveCreated = await createTypesArchive(tsConfig, remoteOptions);

      expect(archiveCreated).toBeTruthy();
      expect(existsSync(archivePath)).toBeTruthy();

      // Only check for .d.ts files
      const zip = new AdmZip(archivePath);
      const dtsEntries = zip
        .getEntries()
        .filter((entry) => entry.entryName.endsWith('.d.ts'));
      expect(dtsEntries).toHaveLength(0);
    });

    it('should handle archive with nested directory structure', async () => {
      // Create nested directories with type definitions
      const nestedPath = join(tsConfig.compilerOptions.outDir, 'nested/deep');
      mkdirSync(nestedPath, { recursive: true });
      writeFileSync(
        join(nestedPath, 'nested.d.ts'),
        'export declare const nested: boolean;',
      );

      const archivePath = join(tmpDir, `${remoteOptions.typesFolder}.zip`);
      const archiveCreated = await createTypesArchive(tsConfig, remoteOptions);

      expect(archiveCreated).toBeTruthy();
      expect(existsSync(archivePath)).toBeTruthy();

      // Verify archive contents including nested structure
      const zip = new AdmZip(archivePath);
      const dtsEntries = zip
        .getEntries()
        .filter((entry) => entry.entryName.endsWith('.d.ts'));
      expect(dtsEntries).toHaveLength(1);
      expect(dtsEntries[0].entryName).toBe(
        'compiledTypesFolder/nested/deep/nested.d.ts',
      );
      expect(dtsEntries[0].getData().toString()).toBe(
        'export declare const nested: boolean;',
      );
    });
  });

  describe('downloadTypesArchive', () => {
    const hostOptions: Required<HostOptions> = {
      moduleFederationConfig: {},
      typesFolder: tmpDir,
      remoteTypesFolder: tmpDir,
      deleteTypesFolder: true,
      maxRetries: 3,
      implementation: '',
      context: process.cwd(),
      abortOnError: true,
      consumeAPITypes: false,
      runtimePkgs: [],
    };

    const destinationFolder = 'typesHostFolder';
    const fileToDownload = 'https://foo.it';

    beforeEach(() => {
      // Clean up and recreate the destination folder
      const archivePath = join(tmpDir, destinationFolder);
      rmSync(archivePath, { recursive: true, force: true });
      mkdirSync(archivePath, { recursive: true });
    });

    it('should correctly extract downloaded archive with type definitions', async () => {
      const archivePath = join(tmpDir, destinationFolder);
      const zip = new AdmZip();

      // Add sample type definition to the archive
      zip.addFile(
        'sample.d.ts',
        Buffer.from('export declare const bar: number;'),
      );

      const mockResponse: AxiosResponse<Buffer> = {
        data: zip.toBuffer(),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {} as XMLHttpRequest,
      };
      vi.spyOn(axios, 'get').mockResolvedValueOnce(mockResponse);

      const result = await downloadTypesArchive(hostOptions)([
        destinationFolder,
        fileToDownload,
      ]);

      expect(result).toEqual([destinationFolder, archivePath]);
      expect(existsSync(join(archivePath, 'sample.d.ts'))).toBeTruthy();
      expect(axios.get).toHaveBeenCalledTimes(1);
      // Only verify the URL and responseType
      const axiosGetMock = vi.mocked(axios.get);
      const [[url, options]] = axiosGetMock.mock.calls;
      expect(url).toBe(fileToDownload);
      expect(options.responseType).toBe('arraybuffer');
    });

    it('should retry on network failure up to maxRetries', async () => {
      const error = new Error('Network error');
      vi.spyOn(axios, 'get').mockRejectedValue(error);

      await expect(() =>
        downloadTypesArchive(hostOptions)([destinationFolder, fileToDownload]),
      ).rejects.toThrowError(/Network error/);

      expect(axios.get).toHaveBeenCalledTimes(hostOptions.maxRetries);
    });

    it('should handle empty archives gracefully', async () => {
      const archivePath = join(tmpDir, destinationFolder);
      const zip = new AdmZip();
      // Add an empty directory to the archive
      zip.addFile('.keep', Buffer.from(''));
      vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: zip.toBuffer(),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {} as XMLHttpRequest,
      } as AxiosResponse<Buffer>);

      const result = await downloadTypesArchive(hostOptions)([
        destinationFolder,
        fileToDownload,
      ]);

      expect(result).toEqual([destinationFolder, archivePath]);
      expect(existsSync(archivePath)).toBeTruthy();
      expect(existsSync(join(archivePath, '.keep'))).toBeTruthy();
    });

    it('should clean up existing folder when deleteTypesFolder is true', async () => {
      const archivePath = join(tmpDir, destinationFolder);
      writeFileSync(join(archivePath, 'old.d.ts'), 'old content');

      const zip = new AdmZip();
      zip.addFile('new.d.ts', Buffer.from('new content'));
      vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: zip.toBuffer(),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {} as XMLHttpRequest,
      } as AxiosResponse<Buffer>);

      await downloadTypesArchive(hostOptions)([
        destinationFolder,
        fileToDownload,
      ]);

      expect(existsSync(join(archivePath, 'old.d.ts'))).toBeFalsy();
      expect(existsSync(join(archivePath, 'new.d.ts'))).toBeTruthy();
    });

    it('should preserve existing folder when deleteTypesFolder is false', async () => {
      const options: Required<HostOptions> = {
        ...hostOptions,
        deleteTypesFolder: false,
      };
      const archivePath = join(tmpDir, destinationFolder);
      writeFileSync(join(archivePath, 'old.d.ts'), 'old content');

      const zip = new AdmZip();
      zip.addFile('new.d.ts', Buffer.from('new content'));
      vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: zip.toBuffer(),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {} as XMLHttpRequest,
      } as AxiosResponse<Buffer>);

      await downloadTypesArchive(options)([destinationFolder, fileToDownload]);

      expect(existsSync(join(archivePath, 'old.d.ts'))).toBeTruthy();
      expect(existsSync(join(archivePath, 'new.d.ts'))).toBeTruthy();
    });

    it('should continue without error when abortOnError is false', async () => {
      const options: Required<HostOptions> = {
        ...hostOptions,
        abortOnError: false,
      };
      vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network error'));

      const result = await downloadTypesArchive(options)([
        destinationFolder,
        fileToDownload,
      ]);

      expect(result).toBeUndefined();
      expect(axios.get).toHaveBeenCalledTimes(options.maxRetries);
    });

    it('should handle malformed zip data', async () => {
      vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: Buffer.from('not a valid zip file'),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {} as XMLHttpRequest,
      } as AxiosResponse<Buffer>);

      await expect(() =>
        downloadTypesArchive(hostOptions)([destinationFolder, fileToDownload]),
      ).rejects.toThrow(/Network error: Unable to download federated mocks/);
    });
  });
});
