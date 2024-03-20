import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { DtsWorker } from './DtsWorker';

async function generateTypesInChildProcess(
  options: DTSManagerOptions,
  extraOptions?: Record<string, any>,
) {
  const dtsWorker = new DtsWorker(options, extraOptions);
  return dtsWorker.controlledPromise;
}

export { generateTypesInChildProcess };
