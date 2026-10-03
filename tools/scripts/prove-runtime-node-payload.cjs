const assert = require('node:assert/strict');
const path = require('node:path');

process.env.IS_ESM_BUILD = 'true';
const core = require(
  path.resolve(__dirname, '../../packages/runtime-core/dist/index.cjs'),
);
const data = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
const globalName = 'runtimeNodePayloadProof';
const image = {
  contract: 1,
  compatibilityId: 'node-payload-proof-family',
  required: ['remote'],
  forbidden: [],
  available: ['remote', 'shared'],
  target: 'node',
  entryLoadingIdentity: 'sdk-node',
};

async function prove(restoredGlobal) {
  core.resetFederationGlobalInfo();
  delete globalThis[globalName];
  const hosts = ['first', 'second'].map((label) => {
    const host = new core.ModuleFederation({
      name: `node-payload-${label}`,
      remotes: [],
    });
    core.attachRuntimeImage(host, image);
    return host;
  });
  const remoteInfo = core.getRemoteInfo({
    name: 'node-payload-remote',
    entry: data('module.exports={init(){},get(){return()=> "first"}}'),
    entryGlobalName: globalName,
  });
  const first = await core.getRemoteEntry({
    origin: hosts[0],
    remoteInfo,
    getEntryUrl: () => remoteInfo.entry,
  });
  assert.equal(await (await first.get('./value'))(), 'first');
  const malformed = restoredGlobal
    ? `const previous=globalThis.${globalName};module.exports={};queueMicrotask(()=>{globalThis.${globalName}=previous;});`
    : 'module.exports={};';
  await assert.rejects(
    core.getRemoteEntry({
      origin: hosts[1],
      remoteInfo,
      getEntryUrl: () => data(malformed),
    }),
    /Node\.js entry evaluator did not return callable get and init exports/,
  );
  if (restoredGlobal) {
    assert.equal(globalThis[globalName], first);
  }
  console.log(
    `PASS ${restoredGlobal ? 'restored-global' : 'malformed-payload'} rejection`,
  );
}

async function main() {
  const selected = process.argv[2];
  if (selected !== 'restored-global') await prove(false);
  if (selected !== 'malformed-payload') await prove(true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
