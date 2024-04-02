import * as path from 'path';
import * as fse from 'fs-extra';

import { DevWorker, DevWorkerOptions } from './DevWorker';

async function removeLogFile(): Promise<void> {
  try {
    const logDir = path.resolve(process.cwd(), '.mf/typesGenerate.log');
    await fse.remove(logDir);
  } catch (err) {
    console.error('removeLogFile error', 'forkDevWorker', err);
  }
}

export function createDevWorker(options: DevWorkerOptions): DevWorker {
  removeLogFile();
  return new DevWorker({ ...options });
}
