'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const app1Root = path.dirname(require.resolve('app1/package.json'));
const app2Root = path.dirname(require.resolve('app2/package.json'));

// App1 uses a layered server build config
const app1ServerBuildScript = fs.readFileSync(
  path.join(app1Root, 'scripts/server.build.js'),
  'utf8',
);

const app1ClientBuildScript = fs.readFileSync(
  path.join(app1Root, 'scripts/client.build.js'),
  'utf8',
);

// App2 uses the same layered server build config
const app2ServerBuildScript = fs.readFileSync(
  path.join(app2Root, 'scripts/server.build.js'),
  'utf8',
);

const app2ClientBuildScript = fs.readFileSync(
  path.join(app2Root, 'scripts/client.build.js'),
  'utf8',
);

describe('Build config guardrails', () => {
  it('uses async-node target for RSC bundle (app1)', () => {
    assert.ok(
      app1ServerBuildScript.includes("target: 'async-node'"),
      'app1 server build should target async-node',
    );
  });

  it('uses async-node target for RSC and SSR bundles (app2)', () => {
    assert.ok(
      app2ServerBuildScript.includes("target: 'async-node'"),
      'app2 build should target async-node',
    );
  });

  it('server build emits both server.rsc.js and ssr.js outputs (app1)', () => {
    assert.ok(
      app1ServerBuildScript.includes("filename: 'server.rsc.js'"),
      'app1 server build should emit server.rsc.js',
    );
    assert.ok(
      app1ServerBuildScript.includes("filename: 'ssr.js'"),
      'app1 server build should emit ssr.js',
    );
  });

  it('enables asyncStartup for server-side federation (app1)', () => {
    // Check for asyncStartup: true with flexible whitespace matching
    assert.ok(
      /asyncStartup:\s*true/.test(app1ServerBuildScript),
      'app1 MF config should set experiments.asyncStartup = true',
    );
  });

  it('enables asyncStartup for server-side federation (app2)', () => {
    assert.ok(
      /asyncStartup:\s*true/.test(app2ServerBuildScript),
      'app2 MF config should set experiments.asyncStartup = true',
    );
  });

  it('enables asyncStartup for client-side federation (app1)', () => {
    assert.ok(
      /asyncStartup:\s*true/.test(app1ClientBuildScript),
      'app1 client MF config should set experiments.asyncStartup = true',
    );
  });

  it('enables asyncStartup for client-side federation (app2)', () => {
    assert.ok(
      /asyncStartup:\s*true/.test(app2ClientBuildScript),
      'app2 client MF config should set experiments.asyncStartup = true',
    );
  });

  it('does not rely on dynamic bootstrap imports for the client entry (app1)', () => {
    // When asyncStartup is enabled, the app entry can be a normal module entry
    // instead of the typical "import('./bootstrap')" pattern.
    assert.ok(
      app1ClientBuildScript.includes("import: '@rsc-demo/framework/bootstrap'"),
      'app1 client entry should be a direct module entry (no dynamic bootstrap)',
    );
    assert.ok(
      !/import\(\s*['"]\.\/bootstrap['"]\s*\)/.test(app1ClientBuildScript),
      'app1 client build should not include import(\"./bootstrap\")',
    );
  });

  it('does not rely on dynamic bootstrap imports for the client entry (app2)', () => {
    assert.ok(
      app2ClientBuildScript.includes("import: '@rsc-demo/framework/bootstrap'"),
      'app2 client entry should be a direct module entry (no dynamic bootstrap)',
    );
    assert.ok(
      !/import\(\s*['"]\.\/bootstrap['"]\s*\)/.test(app2ClientBuildScript),
      'app2 client build should not include import(\"./bootstrap\")',
    );
  });

  it('uses @module-federation/node runtime plugin on server MF (app1)', () => {
    assert.ok(
      app1ServerBuildScript.includes('@module-federation/node/runtimePlugin'),
      'app1 server MF config should include node runtimePlugin',
    );
  });

  it('uses @module-federation/node runtime plugin on server MF (app2)', () => {
    assert.ok(
      app2ServerBuildScript.includes('@module-federation/node/runtimePlugin'),
      'app2 server MF config should include node runtimePlugin',
    );
  });

  it('configures server remotes as script-type HTTP containers (app1)', () => {
    assert.ok(
      app1ServerBuildScript.includes("remoteType: 'script'"),
      'app1 server MF config should set remoteType to script',
    );
  });

  it('emits a CommonJS remote container with async-node target (app2)', () => {
    assert.ok(
      /library:\s*{\s*type:\s*'commonjs-module'/.test(app2ServerBuildScript),
      'app2 remote container should be commonjs-module',
    );
  });
});
