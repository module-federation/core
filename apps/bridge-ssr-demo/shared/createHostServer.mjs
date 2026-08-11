import express from 'express';
import { createRsbuild, loadConfig } from '@rsbuild/core';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { serializeBridgeJSON } from '@module-federation/bridge-shared/dist/index.es.js';

const shouldRender = (url) => {
  if (url.startsWith('/@') || url.startsWith('/__rsbuild')) return false;
  const pathname = url.split('?')[0];
  return !pathname.includes('.') || pathname.endsWith('.html');
};

function assembleDocument(template, html, ssrContext) {
  const marker = '<!--app-content-->';
  if (!template.includes(marker)) {
    throw new Error(`Bridge SSR host template is missing ${marker}`);
  }
  const payload = `<script id="bridge-ssr-host-context" type="application/json">${serializeBridgeJSON(ssrContext)}</script>`;
  return template.replace(marker, html).replace('</body>', `${payload}</body>`);
}

function registerSSRRoute(app, getBundle, getTemplate, label) {
  app.get('*', async (req, res, next) => {
    if (!shouldRender(req.originalUrl)) return next();
    const controller = new AbortController();
    const disconnect = () => controller.abort(new Error('Client disconnected'));
    req.once('aborted', disconnect);
    try {
      const [bundle, template] = await Promise.all([
        getBundle(),
        getTemplate(),
      ]);
      const rendered = await bundle.render(req.originalUrl, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      res
        .status(200)
        .type('html')
        .set('Cache-Control', 'no-store')
        .send(
          assembleDocument(template, rendered.html, rendered.hydrationContext),
        );
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error(`[${label}] SSR request failed`, error, error?.cause);
        next(error);
      }
    } finally {
      req.off('aborted', disconnect);
    }
  });
}

export async function startBridgeHost({ rootDir, port, label }) {
  const host =
    process.env.HOST ?? process.env.BRIDGE_SSR_DEV_HOST ?? 'localhost';
  const app = express();
  if (process.env.BRIDGE_SSR_MODE === 'production') {
    const dist = path.join(rootDir, 'dist');
    const template = await readFile(path.join(dist, 'index.html'), 'utf8');
    const imported = await import(
      `${pathToFileURL(path.join(dist, 'ssr', 'index.js')).href}?${Date.now()}`
    );
    registerSSRRoute(
      app,
      async () => imported.default ?? imported,
      async () => template,
      label,
    );
    app.use(express.static(dist));
  } else {
    const { content } = await loadConfig({ cwd: rootDir });
    const rsbuild = await createRsbuild({
      cwd: rootDir,
      rsbuildConfig: content,
    });
    const server = await rsbuild.createDevServer();
    let bundlePromise;
    const getBundle = () => {
      bundlePromise ??= server.environments.ssr
        .loadBundle('index')
        .catch((error) => {
          bundlePromise = undefined;
          throw error;
        });
      return bundlePromise;
    };
    registerSSRRoute(
      app,
      getBundle,
      () => server.environments.client.getTransformedHtml('index'),
      label,
    );
    app.use(server.middlewares);
    const httpServer = app.listen(port, host, async () => {
      await server.afterListen();
      console.log(`[${label}] ready at http://${host}:${port}`);
    });
    server.connectWebSocket({ server: httpServer });
    return;
  }

  app.listen(port, host, () => {
    console.log(`[${label}] production ready at http://${host}:${port}`);
  });
}
