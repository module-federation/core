const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes, createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const checkout = path.join(root, 'rfc5128-runtime-image');
const oldRoot = path.join(root, 'rfc5128-external-kernel');
const requireOld = createRequire(path.join(oldRoot, 'packages/runtime/package.json'));
const logger = requireOld(path.join(oldRoot, 'packages/runtime-core/dist/utils/logger.cjs'));
const imageSource = fs.readFileSync(path.join(checkout, 'packages/runtime-core/src/runtimeImage.ts'), 'utf8').replace(/^import [^\n]+;\n/, '').replace(/^export /gm, '');
const coreSource = fs.readFileSync(path.join(checkout, 'packages/runtime-core/src/core.ts'), 'utf8');
const normalization = coreSource.slice(coreSource.indexOf('type RuntimeImage ='), coreSource.indexOf('type BridgeHookContext ='));
const method = coreSource.slice(coreSource.indexOf('  formatOptions(globalOptions:'), coreSource.indexOf('\n  registerPlugins(plugins:'));
const format = vm.runInNewContext(stripTypeScriptTypes(imageSource + '\n' + normalization + '\nclass FormatProbe {\n' + method + '\n}\nFormatProbe.prototype.formatOptions'), { error: logger.error, warn: logger.warn });
const image = (overrides = {}) => ({ contract: 1, compatibilityId: 'abi', target: 'node', entryLoadingIdentity: 'loader', required: ['shared'], available: ['shared'], forbidden: [], ...overrides });
function run(input, returnedImage) {
  const state = { remote: 0, shared: 0, init: 0 };
  const host = {
    runtimeImageInitialized: false,
    sharedHandler: { formatShareInfos() { return {}; }, registerShared() { state.shared++; return { allShareInfos: {} }; } },
    remoteHandler: { formatAndRegisterRemote() { state.remote++; return []; } },
    hooks: { lifecycle: { beforeInit: { emit(args) { return { ...args, userOptions: { ...args.userOptions, runtimeImage: returnedImage }, options: { ...args.options, runtimeImage: undefined } }; } }, init: { emit() { state.init++; } } } },
  };
  let result, failure;
  try { result = format.call(host, { name: 'hook', plugins: [], remotes: [], shared: {}, inBrowser: false }, { name: 'hook', remotes: [], runtimeImage: input }); }
  catch (error) { failure = error; }
  return { state, result, failure };
}
for (const changed of [image({ compatibilityId: 'other' }), image({ available: [] , required: [] }), null]) {
  const result = run(image(), changed);
  assert.ok(result.failure, 'known image substitution must reject');
  assert.deepEqual(result.state, { remote: 0, shared: 0, init: 0 });
}
const removed = run(image(), undefined);
assert.equal(removed.failure, undefined);
assert.equal(removed.result.runtimeImage?.compatibilityId, 'abi', 'known initial metadata must survive hook absence');
assert.equal(Object.isFrozen(removed.result.runtimeImage), true);
const added = run(undefined, image());
assert.equal(added.failure, undefined);
assert.equal(added.result.runtimeImage.compatibilityId, 'abi');
assert.deepEqual(added.state, { remote: 1, shared: 1, init: 1 });
console.log(JSON.stringify({ actualFormatOptionsAndNormalizationSource: true, substitutionsRejectBeforeRemoteSharedInit: true, knownImageRetainedAcrossHookAbsence: true, absentInitialHookAddedValidImage: 'allowed first structural admission', scope: 'isolated actual formatOptions method; observes registration calls, not full constructor side effects' }));
