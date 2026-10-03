const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../rfc5128-runtime-image/packages');
const files = ['runtime-core/dist/index.cjs', 'runtime-core/dist/core.cjs', 'runtime-core/dist/shared/index.cjs', 'runtime/dist/instance.cjs', 'runtime-plugins/inject-external-runtime-core-plugin/dist/index.cjs'];
const artifactHashes = Object.fromEntries(files.filter((file) => fs.existsSync(path.join(root, file))).map((file) => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]));
const core = require(path.join(root, 'runtime-core/dist/index.cjs'));
const runtime = require(path.join(root, 'runtime/dist/index.cjs'));
const inject = require(path.join(root, 'runtime-plugins/inject-external-runtime-core-plugin/dist/index.cjs'));
const mode = process.argv[2] || 'reject';
const image = core.parseRuntimeImage({ contract: 1, compatibilityId: 'order', target: 'node', entryLoadingIdentity: 'loader', required: ['shared'], available: ['shared'], forbidden: [] });
const registry = core.CurrentGlobal.__FEDERATION__;
const before = { core: globalThis._FEDERATION_RUNTIME_CORE, from: globalThis._FEDERATION_RUNTIME_CORE_FROM, instances: [...registry.__INSTANCES__], shares: registry.__SHARE__, shareEntries: { ...registry.__SHARE__ } };
try {
  if (mode === 'reject') {
    assert.throws(() => runtime.createInstance({ name: 'order', remotes: [], runtimeImage: image, plugins: [inject({ runtimeImage: image }), { name: 'bad-later-hook', beforeInit(args) { return { ...args, userOptions: { ...args.userOptions, runtimeImage: null } }; } }] }), /RuntimeImageContract/);
    const observed = { mode, rejected: true, coreSlotUnchanged: globalThis._FEDERATION_RUNTIME_CORE === before.core, fromSlotUnchanged: globalThis._FEDERATION_RUNTIME_CORE_FROM === before.from, instancesUnchanged: registry.__INSTANCES__.length === before.instances.length && registry.__INSTANCES__.every((item, index) => item === before.instances[index]), shareMapReferenceUnchanged: registry.__SHARE__ === before.shares, shareEntriesUnchanged: Object.keys(registry.__SHARE__).length === Object.keys(before.shareEntries).length && Object.entries(before.shareEntries).every(([key, value]) => registry.__SHARE__[key] === value) };
    console.log(JSON.stringify(observed));
    assert.ok(Object.entries(observed).filter(([key]) => key !== 'mode').every(([, value]) => value === true), 'Rejected tagged hook changed publication, instances or SHARE');
  } else if (mode === 'success') {
    const instance = runtime.createInstance({ name: 'order-success', remotes: [], runtimeImage: image, plugins: [inject({ runtimeImage: image })] });
    assert.equal(globalThis._FEDERATION_RUNTIME_CORE.ModuleFederation, core.ModuleFederation);
    assert.equal(globalThis._FEDERATION_RUNTIME_CORE_FROM.runtimeImage.compatibilityId, 'order');
    assert.equal(Object.isFrozen(globalThis._FEDERATION_RUNTIME_CORE_FROM.runtimeImage), true);
    assert.equal(registry.__SHARE__[instance.options.id || instance.name], instance.shareScopeMap);
    assert.equal(registry.__INSTANCES__.includes(instance), true);
    console.log(JSON.stringify({ mode, taggedPublicationAfterAdmission: true, shareMapPublishedBeforeReturn: true, registryPublished: true }));
  } else if (mode === 'legacy') {
    let observed;
    runtime.createInstance({ name: 'legacy-order', remotes: [], plugins: [inject(), { name: 'observe-legacy', beforeInit(args) { observed = { corePublishedBeforeLaterHook: globalThis._FEDERATION_RUNTIME_CORE !== undefined, sharePublishedBeforeLaterHook: registry.__SHARE__[args.options.id || args.options.name] === args.origin.shareScopeMap }; return args; } }] });
    assert.equal(observed.corePublishedBeforeLaterHook, true);
    assert.equal(observed.sharePublishedBeforeLaterHook, true);
    console.log(JSON.stringify({ mode, metadata: 'UNCHECKED absent', ...observed }));
  } else throw new Error('Unknown mode');
  console.log(JSON.stringify({ mode, status: 'PASS', artifactHashes }));
} catch (error) {
  console.log(JSON.stringify({ mode, status: 'FAIL', message: String(error.message).split('\n')[0], artifactHashes }));
  process.exitCode = 1;
}
