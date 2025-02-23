import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { DtsWorker } from './DtsWorker';

async function generateTypesInChildProcess(
  options: DTSManagerOptions,
  generateTypesOptions?: { consumeTypes?: boolean },
) {
  const dtsWorker = new DtsWorker(options, generateTypesOptions);
  return dtsWorker.controlledPromise;
}

export { generateTypesInChildProcess };
