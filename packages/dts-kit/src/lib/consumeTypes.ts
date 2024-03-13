import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { getDTSManagerConstructor } from './utils';

async function consumeTypes(options: DTSManagerOptions): Promise<void> {
  const DTSManagerConstructor = getDTSManagerConstructor(
    options.remote?.implementation,
  );
  const dtsManager = new DTSManagerConstructor(options);

  await dtsManager.consumeTypes();
}

export { consumeTypes };
