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
  const outDir = join(tmpDir, 'testsRemoteFolder', 'compiledTypesFolder');

  mkdirSync(outDir, { recursive: true });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true });
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

      const archiveCreated = await createTypesArchive(remoteOptions, outDir);

      expect(archiveCreated).toBeTruthy();
      expect(existsSync(archivePath)).toBeTruthy();
    });

    it('throws for unexisting outDir', async () => {
      expect(createTypesArchive(remoteOptions, '/foo')).rejects.toThrowError();
    });
  });

  describe('downloadTypesArchive', () => {
    const archivePath = join(tmpDir, 'testsHostFolder');
    const hostOptions = {
      moduleFederationConfig: {},
      mocksFolder: archivePath,
      testsFolder: tmpDir,
      deleteTestsFolder: true,
    };

    it('throws for unexisting url', async () => {
      expect(
        downloadTypesArchive(hostOptions)([tmpDir, 'https://foo.it']),
      ).rejects.toThrowError(
        'Network error: Unable to download federated mocks',
      );
      // .rejects.toThrowError('getaddrinfo ENOTFOUND foo.it')
    });

    it('correctly extract downloaded archive', async () => {
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(tmpDir, {});

      axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

      await downloadTypesArchive(hostOptions)([
        'testsHostFolder',
        'https://foo.it',
      ]);
      expect(existsSync(archivePath)).toBeTruthy();
    });
  });
});
