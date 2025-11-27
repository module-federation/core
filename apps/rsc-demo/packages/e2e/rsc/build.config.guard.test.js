'use strict';

const {describe, it} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const app1BuildScript = fs.readFileSync(
  path.resolve(__dirname, '../../app1/scripts/build.js'),
  'utf8'
);
const app2BuildScript = fs.readFileSync(
  path.resolve(__dirname, '../../app2/scripts/build.js'),
  'utf8'
);

describe('Build config guardrails', () => {
  it('uses async-node target for RSC and SSR bundles (app1)', () => {
    assert.ok(
      app1BuildScript.includes("target: 'async-node'"),
      'app1 build should target async-node'
    );
  });

  it('uses async-node target for RSC and SSR bundles (app2)', () => {
    assert.ok(
      app2BuildScript.includes("target: 'async-node'"),
      'app2 build should target async-node'
    );
  });

  it('enables asyncStartup for server-side federation (app1)', () => {
    assert.ok(
      app1BuildScript.includes('experiments: {\n        asyncStartup: true'),
      'app1 MF config should set experiments.asyncStartup = true'
    );
  });

  it('enables asyncStartup for server-side federation (app2)', () => {
    assert.ok(
      app2BuildScript.includes('experiments: {asyncStartup: true}'),
      'app2 MF config should set experiments.asyncStartup = true'
    );
  });

  it('uses @module-federation/node runtime plugin on server MF (app1)', () => {
    assert.ok(
      app1BuildScript.includes('@module-federation/node/runtimePlugin'),
      'app1 server MF config should include node runtimePlugin'
    );
  });

  it('uses @module-federation/node runtime plugin on server MF (app2)', () => {
    assert.ok(
      app2BuildScript.includes('@module-federation/node/runtimePlugin'),
      'app2 server MF config should include node runtimePlugin'
    );
  });
});
