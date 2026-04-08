import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import os from 'os';
import { join } from 'path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { createTestsArchive, downloadTypesArchive } from './archiveHandler';

describe('archiveHandler', () => {
  const tmpDir = mkdtempSync(join(os.tmpdir(), 'archive-handler'));
  const outDir = join(tmpDir, 'testsRemoteFolder', 'compiledTypesFolder');

  mkdirSync(outDir, { recursive: true });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('createTypesArchive', () => {
    const remoteOptions = {
      moduleFederationConfig: {},
      distFolder: tmpDir,
      testsFolder: '@mf-tests',
      deleteTestsFolder: false,
    } as unknown as Required<RemoteOptions>;

    it('correctly creates archive', async () => {
      const archivePath = join(tmpDir, `${remoteOptions.testsFolder}.zip`);

      const archiveCreated = await createTestsArchive(remoteOptions, outDir);

      expect(archiveCreated).toBeTruthy();
      expect(existsSync(archivePath)).toBeTruthy();
    });

    it('throws for unexisting outDir', async () => {
      expect(createTestsArchive(remoteOptions, '/foo')).rejects.toThrowError();
    });
  });

  describe('downloadTypesArchive', () => {
    const destinationFolder = 'testsHostFolder';
    const archivePath = join(tmpDir, destinationFolder);
    const fileToDownload = 'https://foo.it';
    const hostOptions = {
      moduleFederationConfig: {},
      mocksFolder: archivePath,
      testsFolder: tmpDir,
      deleteTestsFolder: true,
      maxRetries: 3,
    };

    it('throws for unexisting url', async () => {
      const fetchMock = vi
        .fn()
        .mockRejectedValue(new Error('getaddrinfo ENOTFOUND foo.it'));
      vi.stubGlobal('fetch', fetchMock);
      expect(
        downloadTypesArchive(hostOptions)([tmpDir, 'https://foo.it']),
      ).rejects.toThrowError(
        'Network error: Unable to download federated mocks',
      );
      // .rejects.toThrowError('getaddrinfo ENOTFOUND foo.it')
    });

    it('correctly extract downloaded archive', async () => {
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
    });

    it('correctly extracts downloaded archive - skips same zip file', async () => {
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
  });
});
