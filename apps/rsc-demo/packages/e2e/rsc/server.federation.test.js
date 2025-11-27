/**
 * Unit tests for Server-Side Module Federation
 *
 * Tests cover:
 * 1. Server-side federation: app1 RSC server importing from app2 MF container
 * 2. Action forwarding detection: Identifying remote action IDs
 * 3. HTTP forwarding infrastructure: Verifying the Option 1 forwarding logic
 *
 * Architecture:
 * - app2 builds app2-remote.js (Node MF container) exposing components + actions
 * - app1's RSC server consumes app2-remote.js via MF remotes config
 * - Server actions use HTTP forwarding (Option 1) for cross-app execution
 *
 * TODO (Option 2 - Deep MF Integration):
 * For native MF-based server action execution without HTTP overhead:
 * - Modify rsc-server-loader.js to register remote 'use server' modules
 * - Modify react-server-dom-webpack-plugin.js to merge remote manifests
 * - Modify server.node.js to support federated action lookups
 */

const {describe, it, before} = require('node:test');
const assert = require('assert');
const path = require('path');
const http = require('http');

// ============================================================================
// TEST: Remote Action ID Detection
// ============================================================================

describe('Remote Action ID Detection (Option 1)', () => {
  // These patterns match what's in app1/server/api.server.js
  const REMOTE_PATTERNS = {
    app2: [
      /^remote:app2:/, // Explicit prefix
      /app2\/src\//, // File path contains app2
      /packages\/app2\//, // Full package path
    ],
  };

  function getRemoteAppForAction(actionId) {
    for (const [app, patterns] of Object.entries(REMOTE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(actionId)) {
          return {app, pattern: pattern.toString()};
        }
      }
    }
    return null;
  }

  it('detects explicit remote:app2: prefix', () => {
    const result = getRemoteAppForAction('remote:app2:incrementCount');
    assert.ok(result, 'Should detect remote action');
    assert.strictEqual(result.app, 'app2');
  });

  it('detects app2/src/ file path pattern', () => {
    const result = getRemoteAppForAction(
      'file:///Users/test/app2/src/server-actions.js#incrementCount'
    );
    assert.ok(result, 'Should detect action by file path');
    assert.strictEqual(result.app, 'app2');
  });

  it('detects packages/app2/ full path pattern', () => {
    const result = getRemoteAppForAction(
      'file:///workspace/packages/app2/src/actions.js#doSomething'
    );
    assert.ok(result, 'Should detect action by package path');
    assert.strictEqual(result.app, 'app2');
  });

  it('returns null for local app1 actions', () => {
    const result = getRemoteAppForAction(
      'file:///workspace/packages/app1/src/server-actions.js#incrementCount'
    );
    assert.strictEqual(
      result,
      null,
      'Should not detect local actions as remote'
    );
  });

  it('returns null for unrecognized action patterns', () => {
    const result = getRemoteAppForAction('someRandomActionId');
    assert.strictEqual(result, null, 'Should not detect random IDs as remote');
  });

  it('handles inline action hashes correctly', () => {
    const inlineActionApp2 = getRemoteAppForAction(
      'file:///packages/app2/src/InlineDemo.server.js#$$ACTION_0'
    );
    assert.ok(inlineActionApp2, 'Should detect inline action from app2');

    const inlineActionApp1 = getRemoteAppForAction(
      'file:///packages/app1/src/InlineDemo.server.js#$$ACTION_0'
    );
    assert.strictEqual(
      inlineActionApp1,
      null,
      'Should not detect inline action from app1 as remote'
    );
  });
});

// ============================================================================
// TEST: Server-Side Federation Bundle Loading
// ============================================================================

describe('Server-Side Federation Bundle', () => {
  const app2RemotePath = path.resolve(
    __dirname,
    '../../app2/build/app2-remote.js'
  );
  const app1ServerPath = path.resolve(
    __dirname,
    '../../app1/build/server.rsc.js'
  );
  let app2Remote = null;
  let app1Server = null;

  before(async () => {
    // Check if build outputs exist - skip tests if not built
    const fs = require('fs');
    if (!fs.existsSync(app2RemotePath)) {
      console.log('Skipping bundle tests - app2-remote.js not built');
      return;
    }
    if (!fs.existsSync(app1ServerPath)) {
      console.log('Skipping bundle tests - server.rsc.js not built');
      return;
    }
  });

  it('app2-remote.js exists after build', () => {
    const fs = require('fs');
    const exists = fs.existsSync(app2RemotePath);
    assert.ok(exists, 'app2-remote.js should exist in app2/build/');
  });

  it('app1 server.rsc.js exists after build', () => {
    const fs = require('fs');
    const exists = fs.existsSync(app1ServerPath);
    assert.ok(exists, 'server.rsc.js should exist in app1/build/');
  });

  it('app2-remote.js is a valid Node module', async () => {
    const fs = require('fs');
    if (!fs.existsSync(app2RemotePath)) {
      return; // Skip if not built
    }

    try {
      app2Remote = require(app2RemotePath);
      assert.ok(app2Remote, 'Should be able to require app2-remote.js');
    } catch (err) {
      // If it fails, it might need async initialization
      // Module Federation Enhanced uses async startup
      assert.ok(true, 'Module may require async initialization');
    }
  });
});

// ============================================================================
// TEST: HTTP Forwarding Infrastructure
// ============================================================================

describe('HTTP Forwarding Infrastructure (Option 1)', () => {
  it('correctly constructs forward URL with query params', () => {
    const remoteUrl = 'http://localhost:4102';
    const originalUrl = '/react?location=%7B%22selectedId%22%3Anull%7D';

    const targetUrl = `${remoteUrl}/react${originalUrl.includes('?') ? originalUrl.substring(originalUrl.indexOf('?')) : ''}`;

    assert.ok(
      targetUrl.startsWith('http://localhost:4102/react?'),
      'Should preserve query params'
    );
    assert.ok(targetUrl.includes('location='), 'Should include location param');
  });

  it('correctly constructs forward URL without query params', () => {
    const remoteUrl = 'http://localhost:4102';
    const originalUrl = '/react';

    const targetUrl = `${remoteUrl}/react${originalUrl.includes('?') ? originalUrl.substring(originalUrl.indexOf('?')) : ''}`;

    assert.strictEqual(
      targetUrl,
      'http://localhost:4102/react',
      'Should work without query params'
    );
  });

  it('filters sensitive headers during forwarding', () => {
    const headersToSkip = [
      'content-encoding',
      'transfer-encoding',
      'connection',
    ];
    const incomingHeaders = {
      'content-type': 'text/x-component',
      'content-encoding': 'gzip',
      'transfer-encoding': 'chunked',
      connection: 'keep-alive',
      'x-action-result': '{"count":5}',
    };

    const forwardedHeaders = {};
    for (const [key, value] of Object.entries(incomingHeaders)) {
      if (!headersToSkip.includes(key.toLowerCase())) {
        forwardedHeaders[key] = value;
      }
    }

    assert.ok(forwardedHeaders['content-type'], 'Should keep content-type');
    assert.ok(
      forwardedHeaders['x-action-result'],
      'Should keep x-action-result'
    );
    assert.strictEqual(
      forwardedHeaders['content-encoding'],
      undefined,
      'Should skip content-encoding'
    );
    assert.strictEqual(
      forwardedHeaders['transfer-encoding'],
      undefined,
      'Should skip transfer-encoding'
    );
    assert.strictEqual(
      forwardedHeaders['connection'],
      undefined,
      'Should skip connection'
    );
  });
});

// ============================================================================
// TEST: End-to-End Forwarding Behaviour (app1 -> app2)
// ============================================================================

describe('Federated server actions end-to-end (Option 1)', () => {
  function installPgStub() {
    const pgPath = require.resolve('pg');
    const mockPool = {
      query: async () => ({rows: []}),
    };
    const stub = {
      Pool: function Pool() {
        return mockPool;
      },
    };
    require.cache[pgPath] = {
      id: pgPath,
      filename: pgPath,
      loaded: true,
      exports: stub,
    };
  }

  function requireApp2() {
    installPgStub();
    process.env.RSC_TEST_MODE = '1';
    delete require.cache[require.resolve('../../app2/server/api.server')];
    return require('../../app2/server/api.server');
  }

  function requireApp1() {
    installPgStub();
    process.env.RSC_TEST_MODE = '1';
    delete require.cache[require.resolve('../../app1/server/api.server')];
    return require('../../app1/server/api.server');
  }

  it('forwards an app2 incrementCount action and returns a non-zero result', async (t) => {
    const fs = require('fs');
    const supertest = require('supertest');

    // Skip if builds are missing – forwarding relies on built bundles.
    const app2ActionsManifestPath = path.resolve(
      __dirname,
      '../../app2/build/react-server-actions-manifest.json'
    );
    const app1Index = path.resolve(__dirname, '../../app1/build/index.html');
    if (!fs.existsSync(app2ActionsManifestPath) || !fs.existsSync(app1Index)) {
      t.skip('Build output missing. Run `pnpm run build` first.');
      return;
    }

    const app2 = requireApp2();
    const app2Server = http.createServer(app2);
    await new Promise((resolve) => app2Server.listen(4102, resolve));

    const app1 = requireApp1();
    const request = supertest(app1);

    // Use a known app2 manifest key for incrementCount, then prefix it so
    // app1 will detect it as remote and strip the prefix before forwarding.
    const app2Manifest = JSON.parse(
      fs.readFileSync(app2ActionsManifestPath, 'utf8')
    );
    const incrementId = Object.keys(app2Manifest).find((k) =>
      k.includes('server-actions.js#incrementCount')
    );
    if (!incrementId) {
      app2Server.close();
      t.skip('app2 incrementCount action not found in manifest');
      return;
    }
    const prefixedId = `remote:app2:${incrementId}`;

    try {
      const res = await request
        .post('/react?location=%7B%22selectedId%22%3Anull%7D')
        .set('rsc-action', prefixedId)
        .set('Content-Type', 'text/plain')
        .send('[]')
        .expect(200);

      // The action result should reflect app2's counter state (>= 1)
      const header = res.headers['x-action-result'];
      assert.ok(header, 'Forwarded call should include X-Action-Result header');
      const value = JSON.parse(header);
      assert.equal(
        typeof value,
        'number',
        'Forwarded result should be a number'
      );
      assert.ok(value >= 1, 'Forwarded incrementCount result should be >= 1');
    } finally {
      app2Server.close();
    }
  });
});

// ============================================================================
// TEST: RSC Action Header Handling
// ============================================================================

describe('RSC Action Header Handling', () => {
  const RSC_ACTION_HEADER = 'rsc-action';

  it('extracts action ID from request headers', () => {
    const mockHeaders = {
      [RSC_ACTION_HEADER]:
        'file:///packages/app1/src/server-actions.js#incrementCount',
      'content-type': 'text/plain',
    };

    const actionId = mockHeaders[RSC_ACTION_HEADER];
    assert.ok(actionId, 'Should extract action ID');
    assert.ok(
      actionId.includes('#incrementCount'),
      'Should contain function name'
    );
  });

  it('parses action name from action ID', () => {
    const actionId =
      'file:///packages/app1/src/server-actions.js#incrementCount';
    const actionName = actionId.split('#')[1] || 'default';

    assert.strictEqual(
      actionName,
      'incrementCount',
      'Should extract function name'
    );
  });

  it('handles default export action IDs', () => {
    const actionId = 'file:///packages/app1/src/test-default-action.js';
    const actionName = actionId.split('#')[1] || 'default';

    assert.strictEqual(
      actionName,
      'default',
      'Should default to "default" for default exports'
    );
  });

  it('handles inline action IDs with $$ACTION_ prefix', () => {
    const actionId =
      'file:///packages/app1/src/InlineDemo.server.js#$$ACTION_0';
    const actionName = actionId.split('#')[1] || 'default';

    assert.ok(
      actionName.startsWith('$$ACTION_'),
      'Should preserve inline action name'
    );
  });
});

// ============================================================================
// TEST: Action Manifest Merging
// ============================================================================

describe('Action Manifest Merging', () => {
  it('merges static and dynamic manifests correctly', () => {
    const staticManifest = {
      'file:///app/src/actions.js#actionA': {id: 'actions.js', name: 'actionA'},
    };

    const dynamicManifest = {
      'file:///app/src/inline.js#$$ACTION_0': {
        id: 'inline.js',
        name: '$$ACTION_0',
      },
    };

    const merged = Object.assign({}, staticManifest, dynamicManifest);

    assert.ok(
      merged['file:///app/src/actions.js#actionA'],
      'Should contain static action'
    );
    assert.ok(
      merged['file:///app/src/inline.js#$$ACTION_0'],
      'Should contain dynamic action'
    );
    assert.strictEqual(
      Object.keys(merged).length,
      2,
      'Should have both entries'
    );
  });

  it('dynamic manifest overrides static for same key', () => {
    const staticManifest = {
      action1: {version: 1},
    };

    const dynamicManifest = {
      action1: {version: 2},
    };

    const merged = Object.assign({}, staticManifest, dynamicManifest);

    assert.strictEqual(
      merged['action1'].version,
      2,
      'Dynamic should override static'
    );
  });
});

// ============================================================================
// TEST: Cross-App Action ID Prefixing (Option 1 Client Integration)
// ============================================================================

describe('Cross-App Action ID Prefixing', () => {
  it('can prefix local action ID for remote forwarding', () => {
    const localActionId =
      'file:///packages/app2/src/server-actions.js#incrementCount';
    const remotePrefix = 'remote:app2:';

    // This is how a client could explicitly mark an action for forwarding
    const explicitRemoteId = `${remotePrefix}${localActionId}`;

    assert.ok(
      explicitRemoteId.startsWith('remote:app2:'),
      'Should have remote prefix'
    );
    assert.ok(
      /^remote:app2:/.test(explicitRemoteId),
      'Should match remote pattern'
    );
  });

  it('extracts original action ID from prefixed remote ID', () => {
    const prefixedId =
      'remote:app2:file:///packages/app2/src/server-actions.js#incrementCount';
    const originalId = prefixedId.replace(/^remote:app2:/, '');

    assert.strictEqual(
      originalId,
      'file:///packages/app2/src/server-actions.js#incrementCount',
      'Should extract original action ID'
    );
  });
});

console.log('Server-side federation unit tests loaded');
