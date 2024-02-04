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
      maxRetries: 1,
    };

    it('throws for unexisting url', async () => {
      expect(
        downloadTypesArchive(hostOptions)([tmpDir, 'https://foo.it']),
      ).rejects.toThrowError(
        'Network error: Unable to download federated mocks',
      );
    });

    it('correctly extract downloaded archive', async () => {
      const archivePath = join(tmpDir, 'typesHostFolder');
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(tmpDir, {});

      axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

      await downloadTypesArchive(hostOptions)([
        'typesHostFolder',
        'https://foo.it',
      ]);
      expect(existsSync(archivePath)).toBeTruthy();
    });

    it('correctly handle exception', async () => {
      const message = 'Rejected value';

      const zip = new AdmZip();
      await zip.addLocalFolderPromise(tmpDir, {});

      axios.get = vi.fn().mockRejectedValueOnce({ message });

      expect(() =>
        downloadTypesArchive(hostOptions)([
          'typesHostFolder',
          'https://foo.it',
        ]),
      ).rejects.toThrowError(message);
    });
  });
});
