import type { AdapterEnv, AdapterConfig } from '@/adapters/types';
import type { AdapterRegistry } from '@/adapters/registry';
import { DEFAULT_STATIC_ROOT } from '@/http/routes/static';

const DEFAULT_PRUNE_INTERVAL_MS = 60 * 60 * 1000;

function envStr(
  env: AdapterEnv,
  name: string,
  fallback?: string,
): string | undefined {
  const v = env[name];
  if (v === undefined || v === '') return fallback;
  return v;
}

function envNum(env: AdapterEnv, name: string, fallback: number): number {
  const v = envStr(env, name);
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export type ResolvedOssEnv = {
  adapterId: string;
  adapterConfig: AdapterConfig;
  corsOrigin: string;
  staticRootDir: string;
  logLevel: string;
  port: number;
  hostname: string;
  pruneIntervalMs: number;
  runtimeEnv: AdapterEnv;
};

export function resolveOssEnv(params: {
  env: AdapterEnv;
  registry: AdapterRegistry;
  defaultAdapterId?: string;
}): ResolvedOssEnv {
  const adapterId =
    envStr(params.env, 'ADAPTER_ID', params.defaultAdapterId) ?? 'local';
  const adapter = params.registry.getAdapterById(adapterId);
  const adapterConfig = adapter.fromEnv ? adapter.fromEnv(params.env) : {};
  return {
    adapterId,
    adapterConfig,
    corsOrigin: envStr(params.env, 'CORS_ORIGIN', '*') ?? '*',
    staticRootDir:
      envStr(params.env, 'LOCAL_STORE_DIR', DEFAULT_STATIC_ROOT) ??
      DEFAULT_STATIC_ROOT,
    logLevel: envStr(params.env, 'LOG_LEVEL', 'info') ?? 'info',
    port: envNum(params.env, 'PORT', 3000),
    hostname: envStr(params.env, 'HOST', '0.0.0.0') ?? '0.0.0.0',
    pruneIntervalMs: envNum(
      params.env,
      'PNPM_PRUNE_INTERVAL_MS',
      DEFAULT_PRUNE_INTERVAL_MS,
    ),
    runtimeEnv: params.env,
  };
}
