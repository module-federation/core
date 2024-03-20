import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { getDTSManagerConstructor } from './utils';

async function generateTypes(
  options: DTSManagerOptions,
  extraOptions?: Record<string, any>,
) {
  const DTSManagerConstructor = getDTSManagerConstructor(
    options.remote?.implementation,
  );
  const dtsManager = new DTSManagerConstructor(options, extraOptions);

  return dtsManager.generateTypes();
}

export { generateTypes };
