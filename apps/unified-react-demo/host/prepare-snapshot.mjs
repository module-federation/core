import { writeFile } from 'node:fs/promises';
import { generateSnapshotFromManifest } from '@module-federation/sdk';
const entry = 'http://localhost:5103/mf-manifest.json';
const response = await fetch(entry);
if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
const manifest = await response.json();
const snapshot = generateSnapshotFromManifest(manifest, { version: entry });
snapshot.reactExposes = manifest.metaData.reactExposes;
if (!snapshot.reactExposes)
  throw new Error('Producer manifest has no expose metadata');
await writeFile(
  new URL('./static-snapshot.json', import.meta.url),
  JSON.stringify(
    { [manifest.name]: snapshot, [`${manifest.name}:${entry}`]: snapshot },
    null,
    2,
  ) + '\n',
);
console.log('Static snapshot captured; rebuild/restart the host to inject it.');
