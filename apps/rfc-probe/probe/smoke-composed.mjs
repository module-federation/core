// Smoke for the composed label: serve the ALL-OFF+expose container (named remoteApp)
// on :3001 and the DEFAULT host on :3002, load each in a fresh Node process with a
// DOM stub whose <script> tags fetch and eval, report handler classes, and have
// the DEFAULT host loadRemote('remoteApp/Button').
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2] || 'M2';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', process.argv[3] || 'composed');
const BUNDLERS = process.argv[4] ? process.argv[4].split(',') : ['webpack', 'rspack'];

const stub = `
const el = (tag) => ({ tagName: String(tag || 'script').toUpperCase(), attrs: {}, src: '', parentNode: null,
  setAttribute(k, v) { this.attrs[k] = v; if (k === 'src') this.src = v; }, getAttribute(k) { return this.attrs[k]; },
  removeAttribute() {}, addEventListener() {}, removeEventListener() {}, appendChild() {}, removeChild() {} });
const head = el('head');
head.appendChild = (node) => {
  if (node.tagName !== 'SCRIPT' || !node.src) return;
  fetch(node.src).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); }).then((code) => {
    const prev = document.currentScript; document.currentScript = node;
    try { (0, eval)(code); } finally { document.currentScript = prev; }
    node.onload && node.onload({ type: 'load', target: node });
  }).catch((e) => { console.log('script ' + node.src + ' failed: ' + e); node.onerror && node.onerror({ type: 'error', target: node }); });
};
globalThis.window = globalThis; globalThis.self = globalThis; globalThis.HTMLScriptElement = class {}; globalThis.HTMLLinkElement = class {};
globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
globalThis.document = { createElement: el, head, body: el('body'), getElementsByTagName: () => [], querySelector: () => null,
  currentScript: { src: process.argv[2], tagName: 'SCRIPT' }, baseURI: process.argv[2], defaultView: globalThis };
globalThis.location = { href: process.argv[2] }; globalThis.navigator = {};
const describe = (i) => i ? 'instance=' + i.name + ' platform=' + (i.platform ? i.platform.name : 'none') + ' plugins=[' + i.options.plugins.map((p) => p.name).join(',') + '] sharedHandler=' + i.sharedHandler.constructor.name + ' remoteHandler=' + i.remoteHandler.constructor.name + ' snapshotHandler=' + i.snapshotHandler.constructor.name : 'no federation instance';
(async () => {
  try { require(process.argv[1]); } catch (e) { console.log('load threw (expected for DEFAULT, non-eager tslib consumed sync): ' + String(e.message).split('\\n')[0]); }
  const inst = globalThis.__FEDERATION__ && globalThis.__FEDERATION__.__INSTANCES__.find((i) => i.name === process.argv[3]);
  console.log(describe(inst));
  if (inst && process.argv[4]) {
    try { const m = await inst.loadRemote(process.argv[4]); console.log('loadRemote(' + process.argv[4] + ') -> ' + (m && m.default ? m.default() : JSON.stringify(m))); }
    catch (e) { console.log('loadRemote threw ' + String(e.message).replace(/\\s+/g, ' ').slice(0, 400)); }
  }
})();
`;

const serve = (dir, port) => new Promise((r) => {
  const s = http.createServer((req, res) => {
    const f = path.join(dir, req.url.split('?')[0]);
    fs.readFile(f, (err, buf) => { if (err) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'content-type': 'text/javascript' }); res.end(buf); } });
  }).listen(port, () => r(s));
});

const run = (file, url, name, remote) => new Promise((resolve) => {
  const p = spawn(process.execPath, ['-e', stub, file, url, name, remote || ''], { timeout: 15000 });
  let out = ''; p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
  p.on('close', () => resolve(out.trim()));
});

for (const bundler of BUNDLERS) {
  const remoteDir = path.join(OUT, bundler, 'ALL-OFF+expose', mode);
  const hostDir = path.join(OUT, bundler, 'DEFAULT', mode);
  const s1 = await serve(remoteDir, 3001);
  const s2 = await serve(hostDir, 3002);
  console.log(`${bundler} ALL-OFF+expose ${mode} remoteEntry.js -> ${await run(path.join(remoteDir, 'remoteEntry.js'), 'http://localhost:3001/remoteEntry.js', 'remoteApp')}`);
  console.log(`${bundler} DEFAULT ${mode} main.js -> ${await run(path.join(hostDir, 'main.js'), 'http://localhost:3002/main.js', 'rfcprobe', 'remoteApp/Button')}`);
  s1.close(); s2.close();
}
