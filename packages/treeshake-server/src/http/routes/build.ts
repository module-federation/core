import { zValidator } from '@hono/zod-validator';
import type { Context } from 'hono';
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { normalizeConfig } from '@/domain/build/normalize-config';
import type { CheckTreeShaking } from '@/domain/build/schema';
import { CheckTreeShakingSchema, ConfigSchema } from '@/domain/build/schema';
import type { AppEnv } from '@/http/env';
import { cleanUp, runBuild } from '@/services/buildService';
import { retrieveCacheItems } from '@/services/cacheService';
import { maybePrune } from '@/services/pnpmMaintenance';
import { type SharedFilePath, upload } from '@/services/uploadService';
import { CommandExecutionError } from '@/utils/runCommand';

export const buildRoute = new Hono<AppEnv>();

buildRoute.post('/', zValidator('json', ConfigSchema), async (c) => {
  const logger = c.get('logger');
  const startTime = Date.now();
  const jobId = nanoid();
  logger.info(jobId);
  const body = c.req.valid('json');
  logger.info(JSON.stringify(body));

  const normalizedConfig = normalizeConfig(body);
  const store = c.get('objectStore');
  const publisher = c.get('projectPublisher');

  try {
    const { cacheItems, excludeShared, restConfig } = await retrieveCacheItems(
      normalizedConfig,
      're-shake',
      store,
    );
    let sharedFilePaths: SharedFilePath[] = [];
    let dir: string | undefined;

    if (Object.keys(restConfig).length > 0) {
      const buildResult = await runBuild(
        normalizedConfig,
        excludeShared,
        're-shake',
      );
      sharedFilePaths = buildResult.sharedFilePaths;
      dir = buildResult.dir;
    }

    const uploadResults = await upload(
      sharedFilePaths,
      cacheItems,
      normalizedConfig,
      body.uploadOptions,
      store,
      publisher,
    );
    cleanUp(dir);

    return c.json({
      jobId,
      status: 'success',
      data: uploadResults,
      cached: cacheItems,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    if (error instanceof CommandExecutionError) {
      if (error.exitCode === 137) {
        void maybePrune();
      }
      return c.json({
        jobId,
        status: 'failed',
        error: error.message,
        command: error.command,
        exitCode: error.exitCode,
        stdout: error.stdout,
        stderr: error.stderr,
      });
    }

    return c.json({
      jobId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

async function handleCheckTreeshake(
  c: Context<AppEnv>,
  body: CheckTreeShaking,
) {
  const logger = c.get('logger');
  const startTime = Date.now();
  const jobId = nanoid();
  logger.info(jobId);
  logger.info(JSON.stringify(body));

  const normalizedConfig = normalizeConfig(body);
  const store = c.get('objectStore');
  const publisher = c.get('projectPublisher');

  try {
    const { cacheItems, excludeShared, restConfig } = await retrieveCacheItems(
      normalizedConfig,
      'full',
      store,
    );
    let sharedFilePaths: SharedFilePath[] = [];
    let dir: string | undefined;

    if (Object.keys(restConfig).length > 0) {
      const buildResult = await runBuild(
        normalizedConfig,
        excludeShared,
        'full',
      );
      sharedFilePaths = buildResult.sharedFilePaths;
      dir = buildResult.dir;
    }

    const uploadResults = await upload(
      sharedFilePaths,
      cacheItems,
      normalizedConfig,
      body.uploadOptions,
      store,
      publisher,
    );
    cleanUp(dir);

    return c.json({
      jobId,
      status: 'success',
      data: uploadResults,
      cached: cacheItems,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    if (error instanceof CommandExecutionError) {
      if (error.exitCode === 137) {
        void maybePrune();
      }
      return c.json({
        jobId,
        status: 'failed',
        error: error.message,
        command: error.command,
        exitCode: error.exitCode,
        stdout: error.stdout,
        stderr: error.stderr,
      });
    }

    return c.json({
      jobId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

buildRoute.post(
  // Keep origin/feat/build naming for the API path.
  '/check-tree-shaking',
  zValidator('json', CheckTreeShakingSchema),
  async (c) => {
    return handleCheckTreeshake(c, c.req.valid('json'));
  },
);
