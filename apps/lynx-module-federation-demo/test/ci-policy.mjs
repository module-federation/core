import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const repoRoot = path.resolve(appRoot, '../..');
const readRepo = (file) => readFile(path.join(repoRoot, file), 'utf8');

const [metroWorkflow, lynxWorkflow, localCi, readme, packageSource] =
  await Promise.all([
    readRepo('.github/workflows/e2e-metro.yml'),
    readRepo('.github/workflows/e2e-lynx.yml'),
    readRepo('tools/scripts/ci-local.mjs'),
    readFile(path.join(appRoot, 'README.md'), 'utf8'),
    readFile(path.join(appRoot, 'package.json'), 'utf8'),
  ]);

assert.match(metroWorkflow, /ANDROID_EMULATOR_PARTITION_SIZE_MB: 1024/);
assert.match(
  metroWorkflow,
  /disk-size: \$\{\{ env\.ANDROID_EMULATOR_PARTITION_SIZE_MB \}\}M/,
);
assert.match(
  metroWorkflow,
  /-partition-size \$\{\{ env\.ANDROID_EMULATOR_PARTITION_SIZE_MB \}\}/,
);
assert.doesNotMatch(metroWorkflow, /ANDROID_EMULATOR_DISK_SPACE/);
assert.doesNotMatch(metroWorkflow, /-partition-size\s+\d+/);
assert.match(lynxWorkflow, /run test:ci-policy/);
const lynxIosJob = lynxWorkflow.slice(lynxWorkflow.indexOf('  e2e-lynx-ios:'));
assert.match(
  lynxIosJob,
  /name: Restore iOS build cache\s+id: ios-build-cache\s+uses: actions\/cache\/restore@/,
);
assert.match(
  lynxIosJob,
  /name: Install iOS dependencies\s+if: steps\.ios-build-cache\.outputs\.cache-hit != 'true'/,
);
assert.match(
  lynxIosJob,
  /name: Validate cached iOS dependencies\s+if: steps\.ios-build-cache\.outputs\.cache-hit == 'true'/,
);
assert.match(
  lynxIosJob,
  /name: Save iOS build cache[\s\S]*?uses: actions\/cache\/save@/,
);
assert.match(lynxIosJob, /lynx-ios-build-v3-/);
for (const action of ['Restore', 'Save']) {
  assert.match(
    lynxIosJob,
    new RegExp(
      `name: ${action} iOS build cache[\\s\\S]*?path: \\|[\\s\\S]*?ios/Pods[\\s\\S]*?ios/OrbitControl\\.xcworkspace[\\s\\S]*?ios/build/DerivedData/Build`,
    ),
  );
}
assert.match(
  lynxIosJob,
  /cmp Podfile\.lock Pods\/Manifest\.lock\s+test -f OrbitControl\.xcworkspace\/contents\.xcworkspacedata/,
);
assert.doesNotMatch(lynxIosJob, /restore-keys:/);
for (const script of ['e2e:native:ci', 'e2e:web:ci']) {
  assert.match(lynxWorkflow, new RegExp(`run ${script}`));
  assert.match(localCi, new RegExp(`'${script}'`));
}

assert.match(readme, /rspack-canary-rspeedy\.mjs/);
assert.match(readme, /@rspack-canary\/core/);
assert.match(
  readme,
  /remove.*Rspeedy supports the repository's\s+Rspack package directly/is,
);

const { scripts } = JSON.parse(packageSource);
const rspeedyCommands = Object.entries(scripts).filter(([, command]) =>
  command.includes('rspeedy'),
);
assert.ok(rspeedyCommands.length > 0);
for (const [name, command] of rspeedyCommands) {
  assert.match(command, /node rspack-canary-rspeedy\.mjs/, name);
}

process.stdout.write('Lynx and Android CI policy validated.\n');
