import * as path from 'path';
import * as fse from 'fs-extra';

import { DevWorker, DevWorkerOptions } from './DevWorker';

async function removeLogFile(): Promise<void> {
  try {
    const logDir = path.resolve(process.cwd(), '.vmok/typesGenerate.log');
    await fse.remove(logDir);
  } catch (err) {
    console.log('removeLogFile error', 'forkDevWorker', 'error');
  }
}

export function createDevWorker(options: DevWorkerOptions): DevWorker {
  removeLogFile();
  const dtsWorker = new DevWorker({ ...options });
  return dtsWorker;
}
