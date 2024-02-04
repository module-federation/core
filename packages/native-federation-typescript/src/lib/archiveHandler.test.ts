import AdmZip from 'adm-zip';
import axios from 'axios';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import os from 'os';
import { join } from 'path';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { createTypesArchive, downloadTypesArchive } from './archiveHandler';

vi.mock('axios');

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

    const axiosGet = vi.mocked(axios.get)

    beforeEach(() => {
      axiosGet.mockReset()
    })

    it('correctly extract downloaded archive', async () => {
      const archivePath = join(tmpDir, 'typesHostFolder');
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(tmpDir, {});

      axiosGet.mockResolvedValueOnce({ data: zip.toBuffer() });

      await downloadTypesArchive(hostOptions)([
        'typesHostFolder',
        'https://foo.it',
      ]);
      expect(existsSync(archivePath)).toBeTruthy();
      expect(axiosGet).toHaveBeenCalledTimes(1)
      expect(axiosGet).toHaveBeenCalledWith('https://foo.it', { responseType: 'arraybuffer' })
    });

    it.only('correctly handle network exceptions', async () => {
      const errorMessage = 'Rejected value'
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(tmpDir, {});

      axiosGet.mockRejectedValue({ message: errorMessage });

      expect(() =>
        downloadTypesArchive(hostOptions)([
          'typesHostFolder',
          'https://foo.it',
        ]),
      ).rejects.toThrowError(`Network error: Unable to download federated mocks for 'typesHostFolder' from 'https://foo.it' because '${errorMessage}'`);

      expect(axiosGet).toHaveBeenCalledTimes(3)
      expect(axiosGet).toHaveBeenCalledWith('https://foo.it', { responseType: 'arraybuffer' })
    });
  });
});
