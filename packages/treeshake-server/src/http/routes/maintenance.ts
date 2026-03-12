import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { AppEnv } from '@/http/env';
import { maybePrune } from '@/services/pnpmMaintenance';

export const maintenanceRoute = new Hono<AppEnv>();

type CleanCacheResponse = {
  jobId: string;
  status: 'success';
  duration: number;
};

maintenanceRoute.post('/', async (c) => {
  const logger = c.get('logger');
  const jobId = nanoid();
  const startTime = Date.now();
  logger.info(jobId);

  await maybePrune();

  return c.json<CleanCacheResponse>({
    jobId,
    status: 'success',
    duration: Date.now() - startTime,
  });
});
