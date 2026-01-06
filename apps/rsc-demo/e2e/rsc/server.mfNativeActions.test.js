/**
 * MF-Native Server Actions (RSC demo)
 *
 * These tests focus on the "Option 2" path:
 * - Remote `use server` modules are loaded via Module Federation.
 * - Server actions are registered in-process via `registerServerReference`.
 * - The runtime can attribute action IDs to a remote without hard-coded URLs.
 *
 * NOTE: This suite intentionally avoids "documentation tests" and instead
 * asserts on real build artifacts + runtime behavior.
 */

'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const app1Root = path.dirname(require.resolve('app1/package.json'));
const app2Root = path.dirname(require.resolve('app2/package.json'));

const app1ServerPath = path.join(app1Root, 'build/server.rsc.js');
const app2ClientManifestPath = path.join(app2Root, 'build/mf-manifest.json');
const app2ServerManifestPath = path.join(
  app2Root,
  'build/mf-manifest.server.json',
);
const app2ActionsManifestPath = path.join(
  app2Root,
  'build/react-server-actions-manifest.json',
);

const buildExists =
  fs.existsSync(app1ServerPath) &&
  fs.existsSync(app2ClientManifestPath) &&
  fs.existsSync(app2ServerManifestPath) &&
  fs.existsSync(app2ActionsManifestPath);

if (!buildExists) {
  console.log(
    '[SKIP] MF-native actions tests require built artifacts. Run `pnpm -C apps/rsc-demo build` first.',
  );
}

describe('MF-Native Server Actions', { skip: !buildExists }, () => {
  let app1Server;
  let app2ClientMfManifest;
  let app2ServerMfManifest;
  let app2ActionsManifest;

  before(async () => {
    app1Server = await Promise.resolve(require(app1ServerPath));
    app2ClientMfManifest = JSON.parse(
      fs.readFileSync(app2ClientManifestPath, 'utf8'),
    );
    app2ServerMfManifest = JSON.parse(
      fs.readFileSync(app2ServerManifestPath, 'utf8'),
    );
    app2ActionsManifest = JSON.parse(
      fs.readFileSync(app2ActionsManifestPath, 'utf8'),
    );
  });

  it('app1 server bundle exports server-action lookup helpers', () => {
    assert.strictEqual(
      typeof app1Server.getServerAction,
      'function',
      'server-entry should export getServerAction()',
    );
    assert.strictEqual(
      typeof app1Server.getDynamicServerActionsManifest,
      'function',
      'server-entry should export getDynamicServerActionsManifest()',
    );

    // Remote action registration is now driven by the federation runtime plugin
    // (rscRuntimePlugin.ensureRemoteActionsForAction), not a bundle export hook.
    assert.ok(
      !('registerRemoteActions' in app1Server),
      'server-entry should not require registerRemoteActions() export',
    );
  });

  it('app2 federation manifests publish RSC metadata without hard-coded URLs', () => {
    const clientRsc =
      app2ClientMfManifest?.additionalData?.rsc ||
      app2ClientMfManifest?.rsc ||
      null;
    assert.ok(clientRsc, 'mf-manifest.json should include additionalData.rsc');
    assert.strictEqual(clientRsc.layer, 'client');
    assert.strictEqual(clientRsc.isRSC, false);
    assert.strictEqual(clientRsc.shareScope, 'client');
    assert.ok(
      clientRsc.exposeTypes && typeof clientRsc.exposeTypes === 'object',
      'client manifest should include exposeTypes',
    );
    assert.strictEqual(
      clientRsc.exposeTypes['./server-actions'],
      'server-action-stubs',
    );
    assert.ok(!clientRsc.remote, 'client manifest should not embed rsc.remote');

    const serverRsc =
      app2ServerMfManifest?.additionalData?.rsc ||
      app2ServerMfManifest?.rsc ||
      null;
    assert.ok(
      serverRsc,
      'mf-manifest.server.json should include additionalData.rsc',
    );
    assert.strictEqual(serverRsc.layer, 'rsc');
    assert.strictEqual(serverRsc.isRSC, true);
    assert.strictEqual(serverRsc.shareScope, 'rsc');
    assert.ok(
      serverRsc.exposeTypes && typeof serverRsc.exposeTypes === 'object',
      'server manifest should include exposeTypes',
    );
    assert.strictEqual(
      serverRsc.exposeTypes['./server-actions'],
      'server-action',
    );
    assert.strictEqual(
      serverRsc.serverActionsManifest,
      'react-server-actions-manifest.json',
    );
    assert.strictEqual(serverRsc.clientManifest, 'react-client-manifest.json');
    assert.ok(!serverRsc.remote, 'server manifest should not embed rsc.remote');
  });

  it('runtime plugin resolves relative serverActionsManifest and indexes remote action IDs', async () => {
    const rscPluginPath = require.resolve(
      '@module-federation/rsc/runtime/rscRuntimePlugin.js',
    );
    const plugin = require(rscPluginPath);

    assert.strictEqual(
      typeof plugin.getRemoteServerActionsManifest,
      'function',
      'runtime plugin should export getRemoteServerActionsManifest()',
    );
    assert.strictEqual(
      typeof plugin.getIndexedRemoteAction,
      'function',
      'runtime plugin should export getIndexedRemoteAction()',
    );

    const remoteUrl = 'http://localhost:4102/mf-manifest.server.json';

    const jsonResponse = (payload) => ({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    const originalFetch = global.fetch;
    global.fetch = async (url) => {
      const href = typeof url === 'string' ? url : url?.href || '';
      if (href.endsWith('/mf-manifest.server.json')) {
        return jsonResponse(app2ServerMfManifest);
      }
      if (href.endsWith('/react-server-actions-manifest.json')) {
        return jsonResponse(app2ActionsManifest);
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({}),
      };
    };

    try {
      const manifest = await plugin.getRemoteServerActionsManifest(remoteUrl);
      assert.ok(manifest, 'expected a server actions manifest response');

      const actionId = Object.keys(app2ActionsManifest)[0];
      assert.ok(actionId, 'expected at least one remote actionId');

      const indexed = plugin.getIndexedRemoteAction(actionId);
      assert.ok(indexed, 'expected actionId to be indexed for attribution');
      assert.strictEqual(indexed.remoteName, 'app2');
      assert.strictEqual(
        indexed.actionsEndpoint,
        'http://localhost:4102/react',
      );
      assert.strictEqual(indexed.remoteEntry, remoteUrl);
      assert.ok(
        !('forwardedId' in indexed),
        'forwardedId should be omitted for unprefixed action IDs',
      );

      const prefixedId = `remote:app2:${actionId}`;
      const indexedPrefixed = plugin.getIndexedRemoteAction(prefixedId);
      assert.ok(
        indexedPrefixed,
        'expected prefixed actionId to be indexed for attribution',
      );
      assert.strictEqual(indexedPrefixed.remoteName, 'app2');
      assert.strictEqual(
        indexedPrefixed.actionsEndpoint,
        'http://localhost:4102/react',
      );
      assert.strictEqual(indexedPrefixed.remoteEntry, remoteUrl);
      assert.strictEqual(indexedPrefixed.forwardedId, actionId);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
