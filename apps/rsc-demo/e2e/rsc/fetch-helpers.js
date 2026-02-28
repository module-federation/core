'use strict';

const fs = require('fs');
const path = require('path');

const app1Root = path.dirname(require.resolve('app1/package.json'));
const app2Root = path.dirname(require.resolve('app2/package.json'));

const app1ManifestPath = path.join(app1Root, 'build/mf-manifest.server.json');
const app2ManifestPath = path.join(app2Root, 'build/mf-manifest.server.json');
const app1RemoteEntryPath = path.join(app1Root, 'build/remoteEntry.server.js');
const app2RemoteEntryPath = path.join(app2Root, 'build/remoteEntry.server.js');
const app1ServerDir = path.join(app1Root, 'build/server');
const app2ServerDir = path.join(app2Root, 'build/server');

let app1ManifestCache = null;
let app2ManifestCache = null;
let app1RemoteEntryCache = null;
let app2RemoteEntryCache = null;

function loadManifest(manifestPath, cache) {
  if (cache) return cache;
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function getManifestForUrl(href) {
  if (href.includes('4101')) {
    app1ManifestCache = loadManifest(app1ManifestPath, app1ManifestCache);
    return app1ManifestCache;
  }
  if (href.includes('4102')) {
    app2ManifestCache = loadManifest(app2ManifestPath, app2ManifestCache);
    return app2ManifestCache;
  }
  app2ManifestCache = loadManifest(app2ManifestPath, app2ManifestCache);
  if (app2ManifestCache) return app2ManifestCache;
  app1ManifestCache = loadManifest(app1ManifestPath, app1ManifestCache);
  return app1ManifestCache;
}

function makeJsonResponse(data, status = 200) {
  const body = JSON.stringify(data);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => body,
    clone() {
      return this;
    },
  };
}

function makeTextResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
    json: async () => JSON.parse(body),
    clone() {
      return this;
    },
  };
}

function loadRemoteEntry(remoteEntryPath, cache) {
  if (cache) return cache;
  if (!fs.existsSync(remoteEntryPath)) return null;
  try {
    return fs.readFileSync(remoteEntryPath, 'utf8');
  } catch {
    return null;
  }
}

function getRemoteEntryForUrl(href) {
  if (href.includes('4101') || href.includes('4000')) {
    app1RemoteEntryCache = loadRemoteEntry(
      app1RemoteEntryPath,
      app1RemoteEntryCache,
    );
    return app1RemoteEntryCache;
  }
  if (href.includes('4102') || href.includes('4001')) {
    app2RemoteEntryCache = loadRemoteEntry(
      app2RemoteEntryPath,
      app2RemoteEntryCache,
    );
    return app2RemoteEntryCache;
  }
  app2RemoteEntryCache = loadRemoteEntry(
    app2RemoteEntryPath,
    app2RemoteEntryCache,
  );
  if (app2RemoteEntryCache) return app2RemoteEntryCache;
  app1RemoteEntryCache = loadRemoteEntry(
    app1RemoteEntryPath,
    app1RemoteEntryCache,
  );
  return app1RemoteEntryCache;
}

function getServerAssetForUrl(href) {
  let pathname = '';
  try {
    pathname = new URL(href).pathname || '';
  } catch {
    pathname = '';
  }
  if (!pathname.includes('/server/')) return null;

  const relPath = pathname.split('/server/')[1];
  if (!relPath) return null;

  let baseDir = null;
  if (href.includes('4101') || href.includes('4000')) {
    baseDir = app1ServerDir;
  } else if (href.includes('4102') || href.includes('4001')) {
    baseDir = app2ServerDir;
  } else {
    baseDir = fs.existsSync(app2ServerDir) ? app2ServerDir : app1ServerDir;
  }

  const filePath = path.join(baseDir, relPath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function maybeHandleManifestFetch(url) {
  if (!url) return null;
  const href =
    typeof url === 'string' ? url : url.href || url.url || url.toString();

  if (!href) return null;
  if (href.endsWith('/mf-manifest.server.json')) {
    const manifest = getManifestForUrl(href);
    if (!manifest) return null;
    return makeJsonResponse(manifest);
  }
  if (href.endsWith('/remoteEntry.server.js')) {
    const remoteEntry = getRemoteEntryForUrl(href);
    if (!remoteEntry) return null;
    return makeTextResponse(remoteEntry);
  }
  if (href.includes('/server/')) {
    const serverAsset = getServerAssetForUrl(href);
    if (!serverAsset) return null;
    return makeTextResponse(serverAsset);
  }

  return null;
}

module.exports = {
  makeJsonResponse,
  maybeHandleManifestFetch,
};
