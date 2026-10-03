const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const vm = require('node:vm');
const repo = path.join(__dirname, 'rfc5036');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rfc5036-installed-proof-'));
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
function installCopy(name) {
  const dir = path.join(root, name);
  const packages = ['managers', 'runtime-tools', 'runtime', 'runtime-core', 'webpack-bundler-runtime', 'sdk', 'error-codes'];
  for (const pkg of packages) {
    const target = path.join(dir, 'node_modules', '@module-federation', pkg);
    fs.mkdirSync(target, { recursive: true });
    fs.copyFileSync(path.join(repo, 'packages', pkg, 'package.json'), path.join(target, 'package.json'));
    fs.cpSync(path.join(repo, 'packages', pkg, 'dist'), path.join(target, 'dist'), { recursive: true });
  }
  return createRequire(path.join(dir, 'proof.cjs'));
}
async function main() {
  const copies = [installCopy('a'), installCopy('b')];
  const managers = copies.map((load) => load('@module-federation/managers/runtime-selection'));
  const anchors = copies.map((load) => load.resolve('@module-federation/runtime-tools'));
  assert.notEqual(managers[0].getSelectionSlot, managers[1].getSelectionSlot);
  for (const order of [[0,1], [1,0]]) {
    const [first, second] = order;
    const a = managers[first], b = managers[second];
    const compiler = {};
    check(`shared compiler slot installed copies ${order}`, () => {
      a.registerRuntimeParticipant(compiler, { pluginName: 'first' });
      b.registerRuntimeParticipant(compiler, { pluginName: 'second' });
      assert.equal(a.getSelectionSlot(compiler), b.getSelectionSlot(compiler));
      assert.equal(a.getSelectionSlot(compiler).participants.length, 2);
      assert.equal(a.getSelectionSlot(compiler).version, 1);
    });
    check(`split-family conflict installed copies ${order}`, () => {
      const compiler = {};
      a.registerRuntimeParticipant(compiler, { pluginName: 'first', implementation: anchors[first] });
      b.registerRuntimeParticipant(compiler, { pluginName: 'second', implementation: anchors[second] });
      assert.throws(() => a.finalizeRuntimeSelection(compiler, 'node', anchors[first]), { code: 'split-family' });
    });
    check(`target conflict installed copies ${order}`, () => {
      const compiler = {};
      a.registerRuntimeParticipant(compiler, { pluginName: 'first', experiments: { optimization: { target: 'web' } } });
      b.registerRuntimeParticipant(compiler, { pluginName: 'second', experiments: { optimization: { target: 'node' } } });
      assert.throws(() => a.finalizeRuntimeSelection(compiler, 'node', anchors[first]), { code: 'target-conflict' });
    });
    check(`child inheritance installed copies ${order}`, () => {
      const parent = {}, child = {};
      a.registerRuntimeParticipant(parent, { pluginName: 'parent', experiments: { optimization: { disableShared: true } } });
      const selection = a.finalizeRuntimeSelection(parent, 'node', anchors[first]);
      b.inheritRuntimeSelection(parent, child);
      assert.equal(b.getSelectionSlot(child).image, selection.image);
      assert.equal(b.getSelectionSlot(child).profile.shared, 'forbidden');
      assert.notEqual(b.getSelectionSlot(child).participants, selection.participants);
      assert.throws(() => b.registerRuntimeParticipant(child, { pluginName: 'late' }), { code: 'late-participant' });
    });
    for (const bad of [false, {participants: [], finalized:false, installed:false}, {version:2, participants:[], finalized:false, installed:false}, {version:1, participants:null, finalized:false, installed:false}, {version:1, participants:[], finalized:true, installed:true}]) {
      check(`invalid slot installed copy ${first}: ${JSON.stringify(bad)}`, () => {
        assert.throws(() => a.getSelectionSlot({ [a.RUNTIME_SELECTION_SLOT]: bad }), {code:'invalid-selection-slot'});
      });
    }
  }
  const runtimes = copies.map((load) => {
    const dist = path.dirname(load.resolve('@module-federation/runtime-core'));
    return { ...load('@module-federation/runtime-core'), ...load(path.join(dist, 'runtimeImage.cjs')), ...load(path.join(dist, 'utils/load.cjs')), ...load(path.join(dist,'utils/remoteInfo.cjs')), ...load(path.join(dist, 'global.cjs')) };
  });
  async function checkAsync(name, fn) { await fn(); checks++; console.log(`PASS ${name}`); }
  const image = { contract:1, compatibilityId:'same-explicit-family', required:['remote'], forbidden:[], available:['remote','shared'], target:'node', entryLoadingIdentity:'same-explicit-loader' };
  function host(api, name, plugin) {
    const origin = new api.ModuleFederation({ name, remotes:[], plugins: plugin ? [plugin] : [] });
    api.attachRuntimeImage(origin, image);
    return origin;
  }
  const container = (label) => vm.runInNewContext(`({get:()=>()=>${JSON.stringify(label)}, init(){}})`);
  for (const order of [[0,1], [1,0]]) {
    const [first,second] = order;
    const a=runtimes[first], b=runtimes[second];
    a.resetFederationGlobalInfo();
    const remoteInfo=a.getRemoteInfo({name:'copy-evaluator-remote',entry:'https://remote.test/same.js'});
    let firstCount=0,secondCount=0;
    const firstHost=host(a, `first-${first}`, {name:'first-evaluator',loadEntry(){firstCount++;return container('first');}});
    const secondHost=host(b, `second-${second}`, {name:'second-evaluator',loadEntry(){secondCount++;return container('second');}});
    await checkAsync(`installed evaluators isolated sequential+concurrent ${order}`,async()=>{
      const initial=await a.getRemoteEntry({origin:firstHost,remoteInfo});
      assert.equal((await initial.get('./value'))(),'first');
      const [repeat,next]=await Promise.all([a.getRemoteEntry({origin:firstHost,remoteInfo}),b.getRemoteEntry({origin:secondHost,remoteInfo})]);
      assert.equal((await repeat.get('./value'))(),'first');
      assert.equal((await next.get('./value'))(),'second');
      assert.equal(firstCount,1);assert.equal(secondCount,1);
    });
    a.resetFederationGlobalInfo();
    let attempts=0;
    const retryHost=host(a,`retry-${first}`,{name:'retry-evaluator',loadEntry(){attempts++;return attempts===1?Promise.reject(new Error('literal-transient-error')):container('recovered');}});
    await checkAsync(`installed rejection retry ${order}`,async()=>{
      await assert.rejects(a.getRemoteEntry({origin:retryHost,remoteInfo}),/literal-transient-error/);
      const recovered=await a.getRemoteEntry({origin:retryHost,remoteInfo});
      assert.equal((await recovered.get('./value'))(),'recovered');assert.equal(attempts,2);
    });
    a.resetFederationGlobalInfo();
    let sharedCalls=0;
    const sharedCallback=()=>{sharedCalls++;return container('equivalent');};
    const sameHosts=[host(a,`shared-a-${first}`,{name:'shared-evaluator',loadEntry:sharedCallback}),host(b,`shared-b-${second}`,{name:'shared-evaluator',loadEntry:sharedCallback})];
    await checkAsync(`installed identical callbacks scoped by host ${order}`,async()=>{
      const results=await Promise.all(sameHosts.map((origin,index)=>runtimes[order[index]].getRemoteEntry({origin,remoteInfo})));
      for(const result of results)assert.equal((await result.get('./value'))(),'equivalent');
      assert.equal(sharedCalls,2);
    });
    a.resetFederationGlobalInfo();
    let factoryCalls=0;
    const factory=()=>()=>{factoryCalls++;return container('factory-equivalent');};
    const factoryHosts=[host(a,`factory-a-${first}`,{name:'factory-a',loadEntry:factory()}),host(b,`factory-b-${second}`,{name:'factory-b',loadEntry:factory()})];
    await checkAsync(`installed equivalent factories succeed ${order}`,async()=>{
      const results=await Promise.all(factoryHosts.map((origin,index)=>runtimes[order[index]].getRemoteEntry({origin,remoteInfo})));
      for(const result of results)assert.equal((await result.get('./value'))(),'factory-equivalent');
      assert.equal(factoryCalls,2);
    });
    a.resetFederationGlobalInfo();
    const scriptUrl=(label)=>'data:text/javascript,'+encodeURIComponent(`module.exports = {get:()=>()=>${JSON.stringify(label)},init(){}};`);
    const scriptedInfo=a.getRemoteInfo({name:`scripted-copy-${first}`,entry:scriptUrl('untransformed')});
    let scriptCalls=0;
    const scriptedHosts=[host(a,`script-a-${first}`,{name:'script-a',createScript(){scriptCalls++;return {url:scriptUrl('script-a')};}}),host(b,`script-b-${second}`,{name:'script-b',createScript(){scriptCalls++;return {url:scriptUrl('script-b')};}})];
    await checkAsync(`installed actual Node createScript evaluators ${order}`,async()=>{
      const results=await Promise.all(scriptedHosts.map((origin,index)=>runtimes[order[index]].getRemoteEntry({origin,remoteInfo:scriptedInfo})));
      assert.equal((await results[0].get('./value'))(),'script-a');
      assert.equal((await results[1].get('./value'))(),'script-b');
      assert.equal(scriptCalls,2);
    });
    Reflect.deleteProperty(global,scriptedInfo.entryGlobalName);
    a.resetFederationGlobalInfo();
    const transformHost=host(a,`transform-host-${first}`);
    const transformInfo=a.getRemoteInfo({name:`transform-copy-${first}`,entry:scriptUrl('untransformed')});
    await checkAsync(`installed actual same-host Node URL transforms ${order}`,async()=>{
      for(const label of ['transform-a','transform-b']) {
        const result=await a.getRemoteEntry({origin:transformHost,remoteInfo:transformInfo,getEntryUrl:()=>scriptUrl(label)});
        assert.equal((await result.get('./value'))(),label);
      }
    });
    Reflect.deleteProperty(global,transformInfo.entryGlobalName);
    a.resetFederationGlobalInfo();
    let fetchCalls=0;
    const nativeFetch=global.fetch;
    global.fetch=async(...args)=>{fetchCalls++;return nativeFetch(...args);};
    try {
      const remoteName=`default-copy-${first}`;
      const defaultInfo=a.getRemoteInfo({name:remoteName,entry:'data:text/javascript,'+encodeURIComponent('module.exports = {get:()=>()=>"default-node",init(){}};')});
      const defaults=[host(a,`default-a-${first}`),host(b,`default-b-${second}`)];
      await checkAsync(`installed default Node loader dedupes ${order}`,async()=>{
        const results=await Promise.all(defaults.map((origin,index)=>runtimes[order[index]].getRemoteEntry({origin,remoteInfo:defaultInfo})));
        assert.equal(results[0],results[1]);
        assert.equal((await results[0].get('./value'))(),'default-node');
        assert.equal(fetchCalls,1);
      });
      Reflect.deleteProperty(global,defaultInfo.entryGlobalName);
    } finally {global.fetch=nativeFetch;}
    a.resetFederationGlobalInfo();
    assert.equal(Object.keys(a.globalLoading).length,0);
    assert.equal(Object.keys(a.globalLoadingMeta).length,0);
  }
  console.log(`RESULT ${checks} passed, 0 skipped`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(root, {recursive:true, force:true}));
