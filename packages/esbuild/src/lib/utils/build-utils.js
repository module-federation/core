import { getBuildAdapter } from '../core/build-adapter';

export async function bundle(options) {
  const adapter = getBuildAdapter();
  return await adapter(options);
}
