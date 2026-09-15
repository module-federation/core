'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const directory = process.argv[2];
const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const report = read('report.json');
const audit = read('audit.json');
const observation = read('process-observations.json');
assert.equal(
  observation.contaminated,
  false,
  'Competing compiler/test detected',
);
assert.equal(
  observation.code,
  2,
  'Expected exact relationship differences, not a failed measurement',
);
assert.deepEqual(audit.heads, ['07527d3fd31a95f98b544c8eec39095cc184504a']);
assert.deepEqual(audit.node, ['v24.18.0']);
assert.equal(
  audit.manifestBuildHashes.length,
  1,
  'Modes must use the identical build',
);
assert.equal(audit.measuredProcesses, 10);
assert.equal(audit.expectedRelationshipDifferences, 4800);
assert.deepEqual(audit.unexpectedDifferences, []);
assert.deepEqual(audit.warnings, []);
assert.equal(report.runs.filter((run) => run.warmup).length, 2);
for (let pair = 0; pair < 5; pair++) {
  const runs = report.runs.filter((run) => !run.warmup && run.pair === pair);
  assert.deepEqual(
    runs.map((run) => run.mode),
    pair % 2 ? ['legacy', 'graph'] : ['graph', 'legacy'],
  );
  for (const run of runs) {
    assert.equal(run.results.length, 4);
    for (const result of run.results) {
      assert.equal(result.toJsonCalls, run.mode === 'legacy' ? 1 : 0);
      if (result.kind === 'incremental') {
        assert.equal(result.builtModules, 1);
        assert(result.hotUpdateAssets > 0);
      }
    }
  }
}
const show = (value) =>
  `${value.median.toFixed(2)} [${value.min.toFixed(2)}–${value.max.toFixed(2)}]`;
const lines = [
  '## Manifest collector: 100 exposes, Node 24.18.0',
  '',
  'Five independent pairs; one warmup pair discarded. Rebuilds summarize each worker’s three-build median first. Values are median [min–max] in milliseconds.',
  '',
  '| Measurement | Legacy | Graph |',
  '| --- | ---: | ---: |',
];
for (const kind of ['cold', 'incremental']) {
  for (const metric of [
    'buildMs',
    'collectorMs',
    ...(kind === 'incremental' ? ['editToDoneMs'] : []),
  ]) {
    lines.push(
      `| ${kind} ${metric} | ${show(audit.summary.legacy[kind][metric].independentWorkerMedians)} | ${show(audit.summary.graph[kind][metric].independentWorkerMedians)} |`,
    );
  }
}
lines.push(
  `| Process peak RSS (MiB) | ${show(audit.summary.legacy.processPeakRssMiB)} | ${show(audit.summary.graph.processPeakRssMiB)} |`,
  '',
  `Foundation: ${audit.heads[0]}. Webpack: ${audit.webpack.join(', ')}. Process observations: ${observation.observations.length}; no competing compiler/test observed. Sampling can miss short jobs and cannot observe underlying host contention.`,
  '',
  'Legacy makes one stats.toJson call per compilation; graph makes zero. Manifest and JS/CSS assets match. Stats differ only in the intentional requires/usedIn additions; full JSON equality is not claimed.',
  '',
  'Timing excludes Node/config startup; process RSS includes setup and all rebuilds. OS cache is not flushed. This synthetic Webpack fixture does not reproduce the original Rsbuild application’s absolute timings.',
);
fs.writeFileSync(path.join(directory, 'summary.md'), lines.join('\n') + '\n');
if (process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
console.log(lines.join('\n'));
