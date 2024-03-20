import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { DtsWorker } from './DtsWorker';

async function generateTypesInChildProcess(options: DTSManagerOptions) {
  const dtsWorker = new DtsWorker(options);
  return dtsWorker.controlledPromise;
}

export { generateTypesInChildProcess };
