import type { FederationRuntimePlugin } from '@module-federation/runtime';
import { getResourceUrl } from '@module-federation/sdk';

import { FederationPrefetch, FederationPrefetchOptions } from './prefetch';

interface OptionType {
  name: string;
  id: string;
  prefetch: Promise<
  {
    value: any;
    functionId: string;
  }[]
  >;
  module: Promise<any>;
}
export const prefetchPlugin = (): FederationRuntimePlugin => ({
  name: 'prefetch-plugin',
  prefetch(options: FederationPrefetchOptions & { id: string }) {
    const { remoteSnapshot, name, id } = options;

    if (
      !remoteSnapshot ||
      !('prefetchEntry' in remoteSnapshot) ||
      !remoteSnapshot.prefetchEntry
    ) {
      return null;
    }

    const prefetchOptions = {
      name,
      remoteSnapshot,
    };
    const federationPrefetch =
      FederationPrefetch.getInstance(name) || new FederationPrefetch(prefetchOptions);
    const prefetchUrl = getResourceUrl(
      remoteSnapshot,
      remoteSnapshot.prefetchEntry,
    );

    const prefetchP = federationPrefetch
      .loadEntry(prefetchUrl)
      .then(async () => {
        const projectExports = federationPrefetch!.getProjectExports();
        if (projectExports instanceof Promise) {
          await projectExports;
        }
        const exports = federationPrefetch!.getExposeExports(id);
        const result = Object.keys(exports).map(k => {
          const value = federationPrefetch!.prefetch({
            id,
            functionId: k,
          });
          const functionId = k;

          return {
            value,
            functionId,
          };
        });
        return result;
      });

    return prefetchP;
  },

  afterPrefetch(options: OptionType) {
    let handler;
    const { name, module, prefetch, id } = options;
    if (Array.isArray(prefetch)) {
      handler = async () => {
        const federationPrefetch = FederationPrefetch.getInstance(name);
        const prefetchVal = prefetch.map(result => result.value);
        const res = await Promise.all([...prefetchVal, module]);
        const exposeModule = res[res.length - 1];

        prefetch.forEach((result: { value: any; functionId: string }) => {
          const { value, functionId } = result;
          federationPrefetch!.memorize(id + functionId, value);
        });
        return exposeModule;
      };
    }
    return handler;
  },
});
