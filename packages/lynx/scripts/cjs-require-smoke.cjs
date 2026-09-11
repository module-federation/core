'use strict';

const assert = require('node:assert/strict');
const lynx = require('..');
const packageLynx = require('@module-federation/lynx');
const reactRuntimePlugin = require('@module-federation/lynx/reactRuntimePlugin');
const runtimePlugin = require('@module-federation/lynx/runtimePlugin');

assert.equal(typeof lynx.pluginLynxModuleFederation, 'function');
assert.equal(lynx.LYNX_RUNTIME_PLUGIN, '@module-federation/lynx/runtimePlugin');
assert.equal(
  packageLynx.pluginLynxModuleFederation,
  lynx.pluginLynxModuleFederation,
);
assert.equal(typeof runtimePlugin.default, 'function');
assert.equal(typeof runtimePlugin.patchLynxChunkLoading, 'function');
assert.equal(typeof reactRuntimePlugin.default, 'function');
