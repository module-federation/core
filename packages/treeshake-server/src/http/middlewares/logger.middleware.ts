// src/http/middlewares/logger.middleware.ts

import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '@/http/env';
import { logger } from '@/infra/logger'; // pino 实例

export const loggerMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const category = c.req.path.split('/')[1] || 'root';
  const child = logger.child({
    category,
    path: c.req.path,
    method: c.req.method,
  });

  c.set('logger', child);
  await next();
};
