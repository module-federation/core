import path from 'node:path';
import type {
  AdapterContext,
  AdapterCreateResult,
  AdapterEnv,
  TreeShakeAdapter,
} from '@/adapters/types';
import { LocalObjectStore } from './localObjectStore';

export type LocalAdapterConfig = {
  rootDir?: string;
  publicBaseUrl?: string;
};

function envStr(
  env: AdapterEnv,
  name: string,
  fallback?: string,
): string | undefined {
  const v = env[name];
  if (v === undefined || v === '') return fallback;
  return v;
}

export class LocalAdapter implements TreeShakeAdapter<LocalAdapterConfig> {
  readonly id = 'local';
  fromEnv(env: AdapterEnv): LocalAdapterConfig {
    return {
      rootDir: envStr(
        env,
        'LOCAL_STORE_DIR',
        path.join(process.cwd(), 'log', 'static'),
      ),
      publicBaseUrl: envStr(env, 'LOCAL_STORE_BASE_URL', '/'),
    };
  }

  async create(
    config: LocalAdapterConfig,
    _context?: AdapterContext,
  ): Promise<AdapterCreateResult> {
    const objectStore = new LocalObjectStore({
      rootDir: config.rootDir,
      publicBaseUrl: config.publicBaseUrl,
    });
    return { objectStore };
  }
}
