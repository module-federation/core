import { getBuildAdapter } from '../core/build-adapter';

export async function bundle(options) {
  const adapter = await getBuildAdapter();
  return await adapter(options);
}
