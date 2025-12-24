import { defineServerConfig } from '@modern-js/server-runtime';
import path from 'path';
import fs from 'fs';
import { readFile } from 'fs/promises';

import type { MiddlewareHandler } from '@modern-js/server-runtime';

const handler: MiddlewareHandler = async (c, next) => {
  try {
    console.log('req.url', c.req.url);
    if (c.req.url?.includes('independent-packages')) {
      const filepath = path.join(
        process.cwd(),
        c.req.url.replace('http://localhost:3001/', 'dist/'),
      );
      console.log('filepath: ', filepath);

      fs.statSync(filepath);
      c.res.headers.set('Access-Control-Allow-Origin', '*');
      c.res.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      );
      c.res.headers.set('Access-Control-Allow-Headers', '*');
      const content = await readFile(filepath, 'utf-8');
      return c.text(content); // 返回文件内容
    } else {
      await next();
    }
  } catch (err) {
    await next();
  }
};

export default defineServerConfig({
  middlewares: [
    {
      name: 'proxy-fallback-shared',
      handler,
    },
  ],
  renderMiddlewares: [],
  plugins: [],
});
