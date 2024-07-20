import AdmZip from 'adm-zip';
import axios from 'axios';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import { readJSONSync } from 'fs-extra';
import os from 'os';
import { join } from 'path';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { createTypesArchive, downloadTypesArchive } from './archiveHandler';
import { HostOptions } from '../interfaces/HostOptions';

describe('archiveHandler', () => {
  const tmpDir = mkdtempSync(join(os.tmpdir(), 'archive-handler'));
  const basicConfig = readJSONSync(
    join(__dirname, '../../..', './tsconfig.spec.json'),
  );
  const tsConfig = {
    ...basicConfig,
  };

  tsConfig.compilerOptions.outDir = join(
    tmpDir,
    'typesRemoteFolder',
    'compiledTypesFolder',
  );

  mkdirSync(tsConfig.compilerOptions.outDir, { recursive: true });

  describe('createTypesArchive', () => {
    const remoteOptions = {
      additionalFilesToCompile: [],
      compiledTypesFolder: 'compiledTypesFolder',
      typesFolder: 'typesRemoteFolder',
      moduleFederationConfig: {},
      tsConfigPath: './tsconfig.spec.json',
      deleteTypesFolder: false,
    } as unknown as Required<RemoteOptions>;

    it('correctly creates archive', async () => {
      const archivePath = join(tmpDir, `${remoteOptions.typesFolder}.zip`);

      const archiveCreated = await createTypesArchive(tsConfig, remoteOptions);

      expect(archiveCreated).toBeTruthy();
      expect(existsSync(archivePath)).toBeTruthy();
    });

    it('throws for unexisting outDir', async () => {
      expect(
        createTypesArchive(
          {
            ...tsConfig,
            compilerOptions: {
              ...tsConfig.compilerOptions,
              outDir: '/foo',
            },
          },
          remoteOptions,
        ),
      ).rejects.toThrowError();
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
    };

    const destinationFolder = 'typesHostFolder';
    const fileToDownload = 'https://foo.it';

    it('correctly extracts downloaded archive', async () => {
      const archivePath = join(tmpDir, destinationFolder);
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(tmpDir, {});

      axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

      await downloadTypesArchive(hostOptions)([
        destinationFolder,
        fileToDownload,
      ]);
      expect(existsSync(archivePath)).toBeTruthy();
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('correctly handles exception', async () => {
      const message = 'Rejected value';

      axios.get = vi.fn().mockRejectedValue(new Error(message));

      await expect(() =>
        downloadTypesArchive(hostOptions)([destinationFolder, fileToDownload]),
      ).rejects.toThrowError(
        `Network error: Unable to download federated mocks for '${destinationFolder}' from '${fileToDownload}' because '${message}'`,
      );
      expect(axios.get).toHaveBeenCalledTimes(hostOptions.maxRetries);
    });

    it('not throw error while set abortOnError: false ', async () => {
      const message = 'Rejected value';
      const hostOptions: Required<HostOptions> = {
        moduleFederationConfig: {},
        typesFolder: tmpDir,
        remoteTypesFolder: tmpDir,
        deleteTypesFolder: true,
        maxRetries: 3,
        implementation: '',
        context: process.cwd(),
        abortOnError: false,
        consumeAPITypes: false,
      };
      axios.get = vi.fn().mockRejectedValue(new Error(message));
      const res = await downloadTypesArchive(hostOptions)([
        destinationFolder,
        fileToDownload,
      ]);
      expect(res).toEqual(undefined);
    });
  });
});
