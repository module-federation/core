#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createAdapterDeps } from '@/adapters/createAdapterDeps';
import { createOssAdapterRegistry } from '@/adapters/registry';
import { resolveOssEnv } from '@/cli/ossEnv';
import { createApp } from './app';
import { createEmbeddedFrontendAdapter } from './frontend/embeddedAdapter';
import { createServer } from './nodeServer';
import { createLogger } from './infra/logger';
import type { FrontendAdapter } from './frontend/types';

const hasIndexHtml = (dir: string | undefined) =>
  Boolean(dir && fs.existsSync(path.join(dir, 'index.html')));

const resolveFrontendDistDir = () => {
  const envDir = process.env.TREESHAKE_FRONTEND_DIST;
  if (envDir) {
    if (hasIndexHtml(envDir)) return envDir;
    throw new Error(
      `TREESHAKE_FRONTEND_DIST is set but index.html is missing: ${envDir}`,
    );
  }

  const candidates = [
    path.resolve(__dirname, 'frontend'),
    path.resolve(__dirname, '..', 'frontend'),
  ];

  for (const candidate of candidates) {
    if (hasIndexHtml(candidate)) return candidate;
  }

  const workspaceCandidates = [
    path.resolve(process.cwd(), 'packages', 'treeshake-frontend', 'dist'),
    path.resolve(process.cwd(), 'treeshake-frontend', 'dist'),
  ];

  for (const candidate of workspaceCandidates) {
    if (hasIndexHtml(candidate)) return candidate;
  }

  return undefined;
};

async function main() {
  const registry = createOssAdapterRegistry();
  const resolved = resolveOssEnv({
    env: { ...process.env, ADAPTER_ID: 'local' },
    registry,
    defaultAdapterId: 'local',
  });
  const logger = createLogger({ level: resolved.logLevel });
  const deps = await createAdapterDeps({
    registry,
    adapterId: resolved.adapterId,
    adapterConfig: resolved.adapterConfig,
    logger,
  });
  const frontendAdapters: FrontendAdapter[] = [];
  const distDir = resolveFrontendDistDir();
  if (!distDir) {
    throw new Error(
      'Treeshake UI dist not found. Rebuild the CLI bundle or set TREESHAKE_FRONTEND_DIST.',
    );
  }
  frontendAdapters.push(
    createEmbeddedFrontendAdapter({
      basePath: process.env.TREESHAKE_FRONTEND_BASE_PATH ?? '/tree-shaking',
      distDir,
      spaFallback:
        process.env.TREESHAKE_FRONTEND_SPA_FALLBACK !== '0' &&
        process.env.TREESHAKE_FRONTEND_SPA_FALLBACK !== 'false',
    }),
  );
  const app = createApp(deps, {
    corsOrigin: resolved.corsOrigin,
    staticRootDir: resolved.staticRootDir,
    pruneIntervalMs: resolved.pruneIntervalMs,
    logger,
    runtimeEnv: resolved.runtimeEnv,
    frontendAdapters,
  });

  createServer({ app, port: resolved.port, hostname: resolved.hostname });
  console.log(
    `Build service listening on http://${resolved.hostname}:${resolved.port}`,
  );
  if (frontendAdapters.length) {
    const basePath =
      process.env.TREESHAKE_FRONTEND_BASE_PATH ?? '/tree-shaking';
    console.log(
      `Treeshake UI available at http://${resolved.hostname}:${resolved.port}${basePath}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
