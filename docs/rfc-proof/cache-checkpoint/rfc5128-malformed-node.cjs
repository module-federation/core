const assert=require('node:assert/strict');
const path=require('node:path');
const root='/Users/zackjackson/Documents/Codex/2026-10-02/task-4/rfc5128-cache/packages/runtime-core/dist';
process.env.IS_ESM_BUILD='true';
const {FederationKernel}=require(path.join(root,'kernel.cjs'));
const {node}=require(path.join(root,'platform/node.cjs'));
const {getRemoteEntry,getRemoteInfo}=require(path.join(root,'utils/load.cjs'));
const data=source=>'data:text/javascript,'+encodeURIComponent(source);
const remoteInfo=getRemoteInfo({name:'app',entry:data('module.exports={};'),entryGlobalName:'skepticalMalformed5128'});
const origin=new FederationKernel({name:'skeptic-5128'},{platform:node});
(async()=>{
 await assert.rejects(getRemoteEntry({origin,remoteInfo,getEntryUrl:()=>remoteInfo.entry}),/did not return callable get\/init exports/);
 console.log(JSON.stringify({case:'custom-malformed-node-payload',result:'rejected with callable get/init diagnostic'}));
})().catch(e=>{console.error(e);process.exitCode=1});
