import AdmZip from 'adm-zip';
import axios from 'axios';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import os from 'os';
import { join } from 'path';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { createTypesArchive, downloadTypesArchive } from './archiveHandler';

describe('archiveHandler', () => {
  const tmpDir = mkdtempSync(join(os.tmpdir(), 'archive-handler'));
  const tsConfig = {
    outDir: join(tmpDir, 'typesRemoteFolder', 'compiledTypesFolder'),
  };

  mkdirSync(tsConfig.outDir, { recursive: true });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true });
  });

  describe('createTypesArchive', () => {
    const remoteOptions = {
      additionalFilesToCompile: [],
      compiledTypesFolder: 'compiledTypesFolder',
      typesFolder: 'typesRemoteFolder',
      moduleFederationConfig: {},
      tsConfigPath: './tsconfig.json',
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
        createTypesArchive({ ...tsConfig, outDir: '/foo' }, remoteOptions),
      ).rejects.toThrowError();
    });
  });

  describe('downloadTypesArchive', () => {
    const hostOptions = {
      moduleFederationConfig: {},
      typesFolder: tmpDir,
      deleteTypesFolder: true,
      maxRetries: 3,
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
      expect(axios.get).toHaveBeenCalledWith(fileToDownload, {
        responseType: 'arraybuffer',
      });
    });

    it('correctly extracts downloaded archive - skips same zip file', async () => {
      const archivePath = join(tmpDir, destinationFolder);

      const zip = new AdmZip();
      await zip.addLocalFolderPromise(tmpDir, {});

      axios.get = vi.fn().mockResolvedValue({ data: zip.toBuffer() });

      const downloader = downloadTypesArchive(hostOptions);

      await downloader([destinationFolder, fileToDownload]);
      await downloader([destinationFolder, fileToDownload]);

      expect(existsSync(archivePath)).toBeTruthy();
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.get.mock.calls[0]).toStrictEqual([
        fileToDownload,
        {
          responseType: 'arraybuffer',
        },
      ]);
      expect(axios.get.mock.calls[1]).toStrictEqual([
        fileToDownload,
        {
          responseType: 'arraybuffer',
        },
      ]);
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
      expect(axios.get).toHaveBeenCalledWith(fileToDownload, {
        responseType: 'arraybuffer',
      });
    });
  });
});
