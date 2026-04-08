import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import os from 'os';
import { join } from 'path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

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

  afterEach(() => {
    vi.unstubAllGlobals();
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
      zip.addLocalFolder(tmpDir);

      const buf = zip.toBuffer();
      const ab = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      );
      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: async () => ab,
      });
      vi.stubGlobal('fetch', fetchMock);

      await downloadTypesArchive(hostOptions)([
        destinationFolder,
        fileToDownload,
      ]);
      expect(existsSync(archivePath)).toBeTruthy();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(fileToDownload);
    });

    it('correctly extracts downloaded archive - skips same zip file', async () => {
      const archivePath = join(tmpDir, destinationFolder);

      const zip = new AdmZip();
      zip.addLocalFolder(tmpDir);

      const buf = zip.toBuffer();
      const ab = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      );
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        arrayBuffer: async () => ab,
      });
      vi.stubGlobal('fetch', fetchMock);

      const downloader = downloadTypesArchive(hostOptions);

      await downloader([destinationFolder, fileToDownload]);
      await downloader([destinationFolder, fileToDownload]);

      expect(existsSync(archivePath)).toBeTruthy();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0]).toStrictEqual([fileToDownload]);
      expect(fetchMock.mock.calls[1]).toStrictEqual([fileToDownload]);
    });

    it('correctly handles exception', async () => {
      const message = 'Rejected value';

      const fetchMock = vi.fn().mockRejectedValue(new Error(message));
      vi.stubGlobal('fetch', fetchMock);

      await expect(() =>
        downloadTypesArchive(hostOptions)([destinationFolder, fileToDownload]),
      ).rejects.toThrowError(
        `Network error: Unable to download federated mocks for '${destinationFolder}' from '${fileToDownload}' because '${message}'`,
      );
      expect(fetchMock).toHaveBeenCalledTimes(hostOptions.maxRetries);
      expect(fetchMock).toHaveBeenCalledWith(fileToDownload);
    });
  });
});
