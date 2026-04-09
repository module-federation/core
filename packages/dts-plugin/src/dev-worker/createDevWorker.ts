import * as path from 'path';
import { rm } from 'fs/promises';

import { DevWorker, DevWorkerOptions } from './DevWorker';

async function removeLogFile(): Promise<void> {
  try {
    const logDir = path.resolve(process.cwd(), '.mf/typesGenerate.log');
    await rm(logDir, { force: true, recursive: true });
  } catch (err) {
    console.error('removeLogFile error', 'forkDevWorker', err);
  }
}

export function createDevWorker(options: DevWorkerOptions): DevWorker {
  removeLogFile();
  return new DevWorker({ ...options });
}
