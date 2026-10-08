import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { PlatformId } from '../shared/contracts.ts';
import { searchProducts } from './data.ts';
import { modelStatus, readModelEnvironment, requestAgent } from './model.ts';
import type { ModelEnvironment } from './model.ts';
import { PlatformStore } from './platform.ts';
import type { DiscoveryParams } from './platform.ts';
import { HttpError, invalid, record } from './validation.ts';

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export interface ServerOptions {
  store?: PlatformStore;
  stateFile?: string | null;
  remotesRoot?: string;
  staticRoot?: string;
  modelEnvironment?: ModelEnvironment;
  modelFetch?: typeof fetch;
}
function json(response: ServerResponse, status: number, value: unknown) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(value));
}
async function body(request: IncomingMessage): Promise<unknown> {
  let length = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 1024 * 1024)
      throw new HttpError(413, 'REQUEST_TOO_LARGE', '请求体超过 1MB');
    chunks.push(Buffer.from(chunk));
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    invalid('请求体必须是 JSON');
  }
}
function checkOrigin(request: IncomingMessage) {
  if (!request.headers.origin) return;
  try {
    const origin = new URL(request.headers.origin);
    if (['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)) return;
  } catch {
    /* rejected below */
  }
  throw new HttpError(403, 'ORIGIN_REJECTED', '本地工作台仅接受本地页面请求');
}
const mime: Record<string, string> = {
  '.json': 'application/json',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
  '.ico': 'image/x-icon',
};
async function serveFile(
  response: ServerResponse,
  root: string,
  path: string,
  head: boolean,
): Promise<boolean> {
  const target = resolve(root, `.${path}`);
  const relativePath = relative(resolve(root), target);
  if (relativePath.startsWith('..') || isAbsolute(relativePath))
    throw new HttpError(403, 'INVALID_PATH', '无效资源路径');
  try {
    const realRoot = await realpath(root);
    const realTarget = await realpath(target);
    const realRelative = relative(realRoot, realTarget);
    if (realRelative.startsWith('..') || isAbsolute(realRelative))
      throw new HttpError(403, 'INVALID_PATH', '无效资源路径');
    if (!(await stat(realTarget)).isFile()) return false;
    const content = await readFile(realTarget);
    response.writeHead(200, {
      'content-type': `${mime[extname(realTarget)] || 'application/octet-stream'}${['.json', '.js', '.html', '.css', '.mjs'].includes(extname(realTarget)) ? '; charset=utf-8' : ''}`,
      'content-length': content.length,
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
    });
    response.end(head ? undefined : content);
    return true;
  } catch (error) {
    if (
      ['ENOENT', 'ENOTDIR'].includes(
        (error as NodeJS.ErrnoException).code || '',
      )
    )
      return false;
    throw error;
  }
}
export async function createWorkspaceServer(options: ServerOptions = {}) {
  const store =
    options.store ||
    (await PlatformStore.open(
      options.stateFile === null
        ? undefined
        : options.stateFile || resolve(appDirectory, '.local/state.json'),
    ));
  const modelEnvironment = options.modelEnvironment || readModelEnvironment();
  const remotesRoot =
    options.remotesRoot || resolve(appDirectory, '.local/remotes');
  const staticRoot = options.staticRoot || resolve(appDirectory, 'dist');
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://localhost');
      const path = decodeURIComponent(url.pathname);
      const method = request.method || 'GET';
      if (path.startsWith('/api/')) {
        checkOrigin(request);
        const platformMatch =
          /^\/api\/platforms\/(root|recommendations)(\/publish)?$/.exec(path);
        const discoveryMatch =
          /^\/api\/discovery\/(root|recommendations)$/.exec(path);
        if (path === '/api/health' && method === 'GET')
          return json(response, 200, { ok: true });
        if (platformMatch) {
          const id = platformMatch[1] as PlatformId;
          if (method === 'GET' && !platformMatch[2])
            return json(response, 200, store.platform(id));
          if (method === 'POST' && platformMatch[2]) {
            const input = record(await body(request), 'publish request');
            return json(response, 200, await store.publish(id, input.config));
          }
        }
        if (discoveryMatch && (method === 'GET' || method === 'POST')) {
          const input =
            method === 'POST'
              ? record(await body(request), 'discovery request')
              : Object.fromEntries(url.searchParams);
          if (
            Object.keys(input).some(
              (key) =>
                !['consumerKey', 'sid', 'basename', 'pathname'].includes(key),
            )
          )
            invalid('发现请求包含未知参数');
          return json(
            response,
            200,
            store.discover(
              discoveryMatch[1] as PlatformId,
              input as DiscoveryParams,
            ),
          );
        }
        if (path === '/api/reset' && method === 'POST')
          return json(response, 200, await store.reset());
        if (path === '/api/products' && method === 'GET')
          return json(
            response,
            200,
            searchProducts(
              url.searchParams.get('q') || '',
              url.searchParams.get('category') || undefined,
            ),
          );
        if (path === '/api/preferences' && method === 'GET')
          return json(response, 200, store.preferences());
        if (path === '/api/preferences' && method === 'PUT')
          return json(
            response,
            200,
            await store.setPreferences(await body(request)),
          );
        if (path === '/api/model/status' && method === 'GET')
          return json(response, 200, modelStatus(modelEnvironment));
        if (path === '/api/agent' && method === 'POST')
          return json(
            response,
            200,
            await requestAgent(
              await body(request),
              modelEnvironment,
              options.modelFetch,
            ),
          );
        throw new HttpError(404, 'NOT_FOUND', '接口不存在');
      }
      if (method !== 'GET' && method !== 'HEAD')
        throw new HttpError(405, 'METHOD_NOT_ALLOWED', '仅支持 GET / HEAD');
      if (path.startsWith('/remotes/')) {
        if (
          await serveFile(
            response,
            remotesRoot,
            path.slice('/remotes'.length),
            method === 'HEAD',
          )
        )
          return;
        throw new HttpError(
          404,
          'REMOTE_NOT_BUILT',
          '远程产物尚未构建，请执行应用的 remotes 构建命令',
        );
      }
      // Modern versions may use dist/static as the browser output directory.
      if (
        await serveFile(
          response,
          staticRoot,
          path === '/' ? '/index.html' : path,
          method === 'HEAD',
        )
      )
        return;
      if (
        await serveFile(
          response,
          resolve(staticRoot, 'static'),
          path === '/' ? '/index.html' : path,
          method === 'HEAD',
        )
      )
        return;
      if (!extname(path)) {
        if (
          await serveFile(
            response,
            staticRoot,
            '/index.html',
            method === 'HEAD',
          )
        )
          return;
        if (
          await serveFile(
            response,
            resolve(staticRoot, 'html'),
            '/index.html',
            method === 'HEAD',
          )
        )
          return;
        if (
          await serveFile(
            response,
            resolve(staticRoot, 'html/index'),
            '/index.html',
            method === 'HEAD',
          )
        )
          return;
        if (
          await serveFile(
            response,
            resolve(staticRoot, 'html/main'),
            '/index.html',
            method === 'HEAD',
          )
        )
          return;
      }
      throw new HttpError(404, 'NOT_FOUND', '资源不存在');
    } catch (error) {
      if (response.headersSent) {
        response.end();
        return;
      }
      if (error instanceof HttpError)
        return json(response, error.status, {
          error: { code: error.code, message: error.message, ...error.details },
        });
      if (error instanceof URIError)
        return json(response, 400, {
          error: { code: 'INVALID_PATH', message: '路径编码无效' },
        });
      // Never log request contents, model credentials or upstream response bodies.
      console.error(
        '[workspace server]',
        error instanceof Error ? error.name : 'InternalError',
      );
      json(response, 500, {
        error: {
          code: 'INTERNAL_ERROR',
          message: '本地服务处理失败，请重试。',
        },
      });
    }
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const server = await createWorkspaceServer();
  server.listen(Number(process.env.PORT || 4174), '127.0.0.1', () =>
    console.log(
      `Workspace data server: http://localhost:${process.env.PORT || 4174}`,
    ),
  );
}
