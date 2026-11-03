#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function sizeRegressions(comparison) {
  const full = comparison.filter((row) => row.flavor.endsWith('-full'));
  assert(full.length > 0, 'Missing full-featured runtime measurements');
  return full.flatMap((row) =>
    [
      ['Bytes', 1024],
      ['Gzip9', 128],
      ['Brotli11', 128],
    ].flatMap(([metric, floor]) => {
      const before = row[`baseline${metric}`];
      const after = row[`candidate${metric}`];
      assert(Number.isFinite(before) && before > 0 && Number.isFinite(after));
      const budget = Math.max(floor, Math.ceil(before * 0.01));
      return after - before > budget
        ? [
            `${row.bundler}/${row.entry}/${row.flavor}: ${metric} +${after - before} B exceeds ${budget} B budget`,
          ]
        : [];
    }),
  );
}

export function renderReport(performance, size) {
  assert.equal(
    performance.baseline,
    size.baseline,
    'Baseline revisions differ',
  );
  assert(performance.summary.length > 0, 'Missing performance measurements');
  const regressions = sizeRegressions(size.comparison);
  const rows = performance.summary.map(
    (m) =>
      `| ${m.name} | ${m.baselineMedian.toFixed(3)} | ${m.candidateMedian.toFixed(3)} | ${m.unit} | ${m.pairedReductionPct.toFixed(1)}% | ${m.observedNoisePct.toFixed(1)}% | ${m.pairsFaster}/${m.pairs} | ${m.interpretation} |`,
  );
  const sizes = size.comparison
    .filter((m) => m.flavor.endsWith('-full'))
    .map(
      (m) =>
        `| ${m.bundler}/${m.entry}/${m.flavor} | ${m.candidateBytes} (${signed(m.deltaBytes)}) | ${m.candidateGzip9} (${signed(m.deltaGzip9)}) | ${m.candidateBrotli11} (${signed(m.deltaBrotli11)}) |`,
    );
  return {
    regressions,
    markdown: [
      '# Runtime core performance and footprint',
      '',
      `Baseline: \`${performance.baseline}\`. Node ${performance.environment.node}; ${performance.environment.platform}; ${performance.environment.cpu}.`,
      '',
      'CPU timings are advisory. Positive reduction means faster. A/A noise is the 95th percentile of absolute paired changes from identical baseline code on this runner; it is an observed noise estimate, not a confidence interval. At least five pairs, an improvement above that estimate and 80% faster pairs are required for the descriptive “faster” label.',
      '',
      'Startup uses a fresh Node process and real runtime APIs with 10 remotes, 20 shared packages (three versions each) and five observer plugins. Containers are in memory: network, browser parse/render time and application work are excluded. The total sums module evaluation, host initialization, shared loading and first loadRemote; fixture preparation and raw container registration are excluded. Profiles repeat this initialization separately and are diagnostic, not cold-start timing evidence.',
      '',
      '| Scenario | Baseline | Candidate | Unit | Paired reduction | A/A noise | Faster pairs | Interpretation |',
      '| --- | ---: | ---: | --- | ---: | ---: | ---: | --- |',
      ...rows,
      '',
      '## Complete browser dependency closures',
      '',
      'All runtime features remain enabled. Both bundlers include dependencies; runtime-core is rebuilt per revision with the same toolchain and other runtime dependencies. This isolates runtime-core changes, not changes to other packages or the lockfile. Compression is gzip 9 / Brotli 11. Each web-full bundle must reproduce its SHA-256 on rebuild.',
      '',
      '| Bundle | Raw bytes (delta) | gzip bytes (delta) | Brotli bytes (delta) |',
      '| --- | ---: | ---: | ---: |',
      ...sizes,
      '',
      'Size gate: full-featured scenarios may grow by at most max(1%, 1,024 raw bytes) and max(1%, 128 compressed bytes). Small compression changes can occur without a meaningful payload regression. Feature opt-outs do not satisfy this gate.',
      '',
      regressions.length
        ? `FAILED:\n\n${regressions.map((r) => `- ${r}`).join('\n')}`
        : 'Size gate passed.',
      '',
    ].join('\n'),
  };
}

function signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [performanceFile, sizeFile, output] = process.argv.slice(2);
  assert(
    performanceFile && sizeFile && output,
    'Usage: report-runtime-dod.mjs performance.json size.json report.md',
  );
  const report = renderReport(
    JSON.parse(readFileSync(performanceFile, 'utf8')),
    JSON.parse(readFileSync(sizeFile, 'utf8')),
  );
  writeFileSync(output, report.markdown);
  if (report.regressions.length) {
    console.error(report.regressions.join('\n'));
    process.exitCode = 1;
  }
}
