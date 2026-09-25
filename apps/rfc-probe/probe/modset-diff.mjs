// Module-set diff between the pre-attach composed run and the attach run (webpack).
import fs from 'node:fs';
const load = (f) => new Set(JSON.parse(fs.readFileSync(f, 'utf8')).map((x) => x.replace(/^.*rfc-probe-main\//, '')));
for (const p of ['ALL-OFF', 'remotes-only', 'ALL-OFF+expose', 'DEFAULT']) for (const m of ['M1', 'M3']) {
  const a = load(`out/composed/webpack/${p}/${m}/modules.json`), b = load(`out/attach/webpack/${p}/${m}/modules.json`);
  console.log(`${p} ${m}: before=${a.size} after=${b.size} added=${JSON.stringify([...b].filter((x) => !a.has(x)))} removed=${JSON.stringify([...a].filter((x) => !b.has(x)))}`);
}
