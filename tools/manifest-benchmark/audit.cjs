'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

function distribution(values) {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return {
    n: sorted.length,
    median:
      sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2,
    min: sorted[0],
    max: sorted.at(-1),
  };
}

for (const file of process.argv.slice(2)) {
  assert(
    file.endsWith('/report.json'),
    'Expected a benchmark report.json path',
  );
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  const exact = report.correctness.flatMap((row) => row.exact);
  const unexpected = exact.filter(
    (diff) =>
      !(
        report.scenario === 'exposes' &&
        diff.legacy === null &&
        ((/^\$\.stats\.exposes\.\d+\.requires\.0$/.test(diff.path) &&
          diff.graph === './shared.js') ||
          (/^\$\.stats\.shared\.0\.usedIn\.\d+$/.test(diff.path) &&
            /^\.\/Component\d+$/.test(diff.graph)))
      ),
  );
  if (report.scenario === 'exposes') {
    for (const row of report.correctness)
      assert.equal(row.exact.length, report.parameters.exposes * 2);
  }
  const summary = {};
  for (const mode of ['legacy', 'graph']) {
    const runs = report.runs.filter((run) => !run.warmup && run.mode === mode);
    summary[mode] = {};
    summary[mode].processPeakRssMiB = distribution(
      runs.map((run) => Math.max(...run.results.map((row) => row.peakRssMiB))),
    );
    for (const kind of ['cold', 'incremental']) {
      const rows = runs.map((run) =>
        run.results.filter((row) => row.kind === kind),
      );
      const keys = [
        'buildMs',
        'collectorMs',
        'toJsonMs',
        'peakRssMiB',
        ...(kind === 'incremental' ? ['editToDoneMs'] : []),
      ];
      summary[mode][kind] = Object.fromEntries(
        keys.map((key) => [
          key,
          {
            independentWorkerMedians: distribution(
              rows.map(
                (group) => distribution(group.map((row) => row[key])).median,
              ),
            ),
            allBuilds: distribution(
              rows.flatMap((group) => group.map((row) => row[key])),
            ),
          },
        ]),
      );
      summary[mode][kind].toJsonCounts = [
        ...new Set(
          rows.flatMap((group) => group.map((row) => row.toJsonCalls)),
        ),
      ];
      summary[mode][kind].builtModuleCounts = [
        ...new Set(
          rows.flatMap((group) => group.map((row) => row.builtModules)),
        ),
      ];
      summary[mode][kind].modules = [
        ...new Set(rows.flatMap((group) => group.map((row) => row.modules))),
      ];
      summary[mode][kind].chunks = [
        ...new Set(rows.flatMap((group) => group.map((row) => row.chunks))),
      ];
    }
  }
  const audit = {
    report: file,
    measuredProcesses: report.runs.filter((run) => !run.warmup).length,
    heads: [...new Set(report.runs.map((run) => run.coreHead))],
    manifestBuildHashes: [
      ...new Set(report.runs.map((run) => run.builtManifestSha256)),
    ],
    node: [...new Set(report.runs.map((run) => run.node))],
    webpack: [...new Set(report.runs.map((run) => run.webpack))],
    expectedRelationshipDifferences: exact.length - unexpected.length,
    unexpectedDifferences: unexpected,
    warnings: [
      ...new Set(
        report.runs.flatMap((run) =>
          run.results.flatMap((row) => row.warnings),
        ),
      ),
    ],
    summary,
  };
  fs.writeFileSync(
    file.replace(/report\.json$/, 'audit.json'),
    JSON.stringify(audit, null, 2),
  );
  console.log(JSON.stringify(audit, null, 2));
  assert.equal(
    unexpected.length,
    0,
    'Unexpected artifact differences retained in report',
  );
}
