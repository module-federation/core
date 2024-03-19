import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { DtsWorker } from './DtsWorker';
import { getDTSManagerConstructor } from './utils';

async function generateTypesInChildProcess(
  options: DTSManagerOptions,
): Promise<void> {
  const dtsWorker = new DtsWorker({ ...options });
  return dtsWorker.controlledPromise;
}

async function generateTypes(options: DTSManagerOptions) {
  const DTSManagerConstructor = getDTSManagerConstructor(
    options.remote?.implementation,
  );
  const dtsManager = new DTSManagerConstructor(options);

  return dtsManager.generateTypes();
}

export { generateTypes, generateTypesInChildProcess };
