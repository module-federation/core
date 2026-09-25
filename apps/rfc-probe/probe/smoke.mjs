// Load an emitted host bundle in a fresh Node process with a minimal DOM stub
// and report whether the federation runtime initialised. Usage: node smoke.mjs <main.js>...
import { spawnSync } from 'node:child_process';
const stub = `
const el = () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, getAttribute() {}, removeAttribute() {}, tagName: 'SCRIPT', src: '' });
globalThis.window = globalThis; globalThis.self = globalThis;
globalThis.document = { createElement: el, head: el(), body: el(), getElementsByTagName: () => [el()], querySelector: () => null, currentScript: { src: 'http://localhost/main.js', tagName: 'SCRIPT' }, baseURI: 'http://localhost/', defaultView: globalThis };
globalThis.location = { href: 'http://localhost/' }; globalThis.navigator = {};
try {
  require(require('node:path').resolve(process.argv[1]));
  const fed = globalThis.__FEDERATION__;
  const inst = fed && fed.__INSTANCES__ && fed.__INSTANCES__[0];
  console.log(inst ? 'ok instance=' + inst.name + ' plugins=' + inst.options.plugins.map((p) => p.name).join(',') + ' remotes=' + inst.options.remotes.length + ' shared=' + Object.keys(inst.options.shared).length + ' sharedHandler=' + inst.sharedHandler.constructor.name + ' remoteHandler=' + inst.remoteHandler.constructor.name : 'no federation instance');
} catch (e) { console.log('THREW ' + String(e.message).split('\\n')[0]); }
`;
for (const file of process.argv.slice(2)) {
  const r = spawnSync(process.execPath, ['-e', stub, file], { encoding: 'utf8', timeout: 10000 });
  console.log(file.replace(/.*\/out\//, ''), '->', (r.stdout.trim() || r.stderr.trim().split('\n')[0]));
}
