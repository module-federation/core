import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppEnv } from '@/http/env';
import { createDiMiddleware } from '@/http/middlewares/di.middleware';
import { loggerMiddleware } from '@/http/middlewares/logger.middleware';
import { routes } from '@/http/routes';
import { createStaticRoute, DEFAULT_STATIC_ROOT } from '@/http/routes/static';
import type { ObjectStore } from '@/ports/objectStore';
import type { ProjectPublisher } from '@/ports/projectPublisher';
import type { FrontendAdapter } from '@/frontend/types';
import { startPeriodicPrune } from '@/services/pnpmMaintenance';
import { setLogger } from '@/infra/logger';
import { setRuntimeEnv } from '@/utils/runtimeEnv';

import { timeout } from 'hono/timeout';

export function createApp(
  deps: {
    objectStore: ObjectStore;
    projectPublisher?: ProjectPublisher;
  },
  opts?: {
    corsOrigin?: string;
    staticRootDir?: string;
    pruneIntervalMs?: number;
    logger?: Parameters<typeof setLogger>[0];
    runtimeEnv?: Record<string, string | undefined>;
    frontendAdapters?: FrontendAdapter[];
    appExtensions?: Array<(app: Hono<AppEnv>) => void>;
  },
) {
  if (opts?.logger) {
    setLogger(opts.logger);
  }
  setRuntimeEnv(opts?.runtimeEnv ?? process.env);

  const app = new Hono<AppEnv>();
  const corsOrigin = opts?.corsOrigin ?? '*';
  const staticRootDir = opts?.staticRootDir ?? DEFAULT_STATIC_ROOT;

  app.use(
    '*',
    cors({
      origin: corsOrigin,
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use('*', loggerMiddleware);
  app.use('*', createDiMiddleware(deps));
  // 1 minute timeout for all routes
  app.use('*', timeout(60000));

  if (opts?.appExtensions?.length) {
    for (const extend of opts.appExtensions) {
      extend(app);
    }
  }

  // Keep the legacy route name from origin/feat/build for backward compatibility.
  app.get('/tree-shaking-shared/healthz', (c) =>
    c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
  );

  app.route('/tree-shaking-shared', routes);
  app.route('/', createStaticRoute({ rootDir: staticRootDir }));

  if (opts?.frontendAdapters?.length) {
    for (const adapter of opts.frontendAdapters) {
      adapter.register(app);
    }
  }

  startPeriodicPrune(opts?.pruneIntervalMs);

  return app;
}
