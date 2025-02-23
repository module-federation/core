import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { getDTSManagerConstructor } from './utils';

async function generateTypes(
  options: DTSManagerOptions,
  generateTypesOptions?: { consumeTypes?: boolean },
) {
  const DTSManagerConstructor = getDTSManagerConstructor(
    options.remote?.implementation,
  );
  const dtsManager = new DTSManagerConstructor(options);

  return dtsManager.generateTypes(generateTypesOptions);
}

export { generateTypes };
