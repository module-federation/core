import { serve } from '@hono/node-server';
import type { Hono } from 'hono';
import type { AppEnv } from '@/http/env';

export function createServer(opts: {
  app: Hono<AppEnv>;
  port?: number;
  hostname?: string;
}) {
  const port = opts.port ?? 3000;
  const hostname = opts.hostname ?? '0.0.0.0';
  return serve({
    fetch: opts.app.fetch,
    port,
    hostname,
  });
}
