import { LocalAdapter } from '@/adapters/local';
import type { TreeShakeAdapter } from './types';

export type AdapterRegistry = {
  adapters: TreeShakeAdapter[];
  getAdapterById: (id: string) => TreeShakeAdapter;
};

export function createAdapterRegistry(
  adapters: TreeShakeAdapter[],
): AdapterRegistry {
  return {
    adapters,
    getAdapterById: (id: string) => {
      const found = adapters.find((a) => a.id === id);
      if (!found) throw new Error(`Unknown ADAPTER_ID: ${id}`);
      return found;
    },
  };
}

export function createOssAdapterRegistry(): AdapterRegistry {
  return createAdapterRegistry([new LocalAdapter()]);
}
