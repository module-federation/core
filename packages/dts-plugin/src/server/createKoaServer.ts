import fs from 'fs-extra';
import Koa from 'koa';
import { getFreePort, getIPV4 } from './utils';
import { DEFAULT_TAR_NAME } from './constant';

interface CreateKoaServerOptions {
  typeTarPath: string;
}

export async function createKoaServer(
  options: CreateKoaServerOptions,
): Promise<{
  server: Koa;
  serverAddress: string;
}> {
  const { typeTarPath } = options;
  const freeport = await getFreePort();
  const app = new Koa();

  app.use(async (ctx, next) => {
    if (ctx.path === `/${DEFAULT_TAR_NAME}`) {
      ctx.status = 200;
      ctx.body = fs.createReadStream(typeTarPath);
      ctx.response.type = 'application/x-gzip';
    } else {
      await next();
    }
  });

  app.listen(freeport);

  return {
    server: app,
    serverAddress: `http://${getIPV4()}:${freeport}`,
  };
}
