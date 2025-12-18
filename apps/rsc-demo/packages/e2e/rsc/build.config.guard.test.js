'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// App1 uses modular build configs
const app1ServerBuildScript = fs.readFileSync(
  path.resolve(__dirname, '../../app1/scripts/server.build.js'),
  'utf8',
);
const app1SsrBuildScript = fs.readFileSync(
  path.resolve(__dirname, '../../app1/scripts/ssr.build.js'),
  'utf8',
);

// App2 uses a single combined build.js
const app2BuildScript = fs.readFileSync(
  path.resolve(__dirname, '../../app2/scripts/build.js'),
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
      app2BuildScript.includes("target: 'async-node'"),
      'app2 build should target async-node',
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
      /asyncStartup:\s*true/.test(app2BuildScript),
      'app2 MF config should set experiments.asyncStartup = true',
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
      app2BuildScript.includes('@module-federation/node/runtimePlugin'),
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
      app2BuildScript.includes("library: {type: 'commonjs-module'"),
      'app2 remote container should be commonjs-module',
    );
  });
});
