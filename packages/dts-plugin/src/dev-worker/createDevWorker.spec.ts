import { describe, expect, it, rs } from '@rstest/core';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { createDevWorker } from './createDevWorker';
import type { DevWorkerOptions } from './DevWorker';

rs.mock('./DevWorker', () => ({ DevWorker: class {} }));

describe('development worker diagnostics', () => {
  it('preserves existing shared diagnostic history across worker starts', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'mf-worker-logs-'));
    await mkdir(path.join(cwd, '.mf'));
    const filename = path.join(cwd, '.mf/typesGenerate.log');
    await writeFile(filename, 'broker history\n');
    const currentDirectory = rs.spyOn(process, 'cwd').mockReturnValue(cwd);
    try {
      createDevWorker({} as DevWorkerOptions);
      createDevWorker({} as DevWorkerOptions);
      // Let asynchronous startup cleanup finish if it is accidentally restored.
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(await readFile(filename, 'utf8')).toBe('broker history\n');
    } finally {
      currentDirectory.mockRestore();
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
