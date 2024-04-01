import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { getDTSManagerConstructor } from './utils';

async function generateTypes(options: DTSManagerOptions) {
  const DTSManagerConstructor = getDTSManagerConstructor(
    options.remote?.implementation,
  );
  const dtsManager = new DTSManagerConstructor(options);

  return dtsManager.generateTypes();
}

export { generateTypes };
