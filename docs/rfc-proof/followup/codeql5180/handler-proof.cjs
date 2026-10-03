const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const baseline = path.resolve(__dirname, '../../publicpath/tools/repros/composed-shared-fallback.cjs');
const proposed = process.argv[2] && path.resolve(process.argv[2]);
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-offline-handler-'));
const asset = 'independent-packages/shared_lib/1.0.0/share-entry.js';
const trusted = path.join(fixture, 'dist', asset);
fs.mkdirSync(path.dirname(trusted), { recursive: true });
fs.writeFileSync(trusted, 'SAFE_EXPECTED_FALLBACK');
fs.writeFileSync(path.join(fixture, 'outside.txt'), 'HARMLESS_OUTSIDE_DIST_SENTINEL');
fs.writeFileSync(path.join(fixture, 'dist', 'main.cjs'), 'HARMLESS_UNEXPECTED_OUTPUT');
const cases = [
  ['expected asset', '/' + asset, 200, 'SAFE_EXPECTED_FALLBACK'],
  ['expected asset with query', '/' + asset + '?proof=1', 200, 'SAFE_EXPECTED_FALLBACK'],
  ['literal traversal', '/../outside.txt', 404, undefined],
  ['nested traversal', '/independent-packages/../../outside.txt', 404, undefined],
  ['encoded traversal', '/%2e%2e/outside.txt', 404, undefined],
  ['encoded slash traversal', '/..%2foutside.txt', 404, undefined],
  ['unrelated emitted asset', '/main.cjs', 404, undefined],
  ['missing URL', undefined, 404, undefined],
];
function capture(file) {
 const source = fs.readFileSync(file, 'utf8');
 const match = source.match(/^const server = http\.createServer\(([\s\S]*?)\);\nlet compiler;/m);
 assert.ok(match, 'capture the actual existing handler callback without running the script');
 const reads=[];
 const localFs = {
  existsSync(filename) { assert.ok(filename.startsWith(fixture + path.sep), 'probe may inspect only its own fixture'); return fs.existsSync(filename); },
  readFileSync(filename) { assert.ok(filename.startsWith(fixture + path.sep), 'probe may read only its own harmless fixture'); reads.push(filename); return fs.readFileSync(filename); },
 };
 const handler = vm.runInNewContext('(' + match[1] + ')', {fs:localFs,path,dir:fixture,requests:[]});
 return {handler,reads,source};
}
function invoke(handler,url) {
 const response={status:200,body:undefined};
 try { handler({url},{writeHead(status){response.status=status;},end(body){response.body=body===undefined?undefined:String(body);}}); }
 catch(error) {response.error=error.message;}
 return response;
}
try {
 const old = capture(baseline);
 for(const [label,url] of cases.slice(0,-1)) {
  const actual=invoke(old.handler,url);
  console.log(JSON.stringify({version:'baseline',label,...actual}));
  if(label.includes('literal traversal')||label.includes('nested traversal')) {
   assert.equal(actual.status,200);assert.equal(actual.body,'HARMLESS_OUTSIDE_DIST_SENTINEL');
  }
 }
 if(proposed) {
  const next=capture(proposed);
  for(const [label,url,status,body] of cases) {
   const actual=invoke(next.handler,url);
   assert.equal(actual.error,undefined);assert.equal(actual.status,status);assert.equal(actual.body,body);
   console.log(JSON.stringify({version:'proposal',label,...actual}));
  }
  assert.deepEqual([...new Set(next.reads)],[trusted]);
  assert.equal(next.source.slice(next.source.indexOf('let compiler;')),old.source.slice(old.source.indexOf('let compiler;')), 'all compilation/topology/fallback/runtime assertions must remain byte-identical');
  console.log(JSON.stringify({version:'proposal',readTargets:'only fixed trusted fallback',compilerAndCoverage:'unchanged',listenerActivated:false}));
 }
} finally {fs.rmSync(fixture,{recursive:true,force:true});}
