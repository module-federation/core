import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderReport, sizeRegressions } from './report-runtime-dod.mjs';

const base = {
  bundler: 'webpack',
  entry: 'runtime',
  flavor: 'web-full',
  baselineBytes: 60000,
  candidateBytes: 60000,
  baselineGzip9: 18000,
  candidateGzip9: 18000,
  baselineBrotli11: 16000,
  candidateBrotli11: 16000,
};

test('size budgets accept compression noise and fail material growth', () => {
  assert.deepEqual(
    sizeRegressions([{ ...base, candidateBrotli11: 16010 }]),
    [],
  );
  assert.equal(sizeRegressions([{ ...base, candidateGzip9: 18180 }]).length, 0);
  assert.equal(sizeRegressions([{ ...base, candidateGzip9: 18181 }]).length, 1);
  assert.equal(sizeRegressions([{ ...base, candidateBytes: 61025 }]).length, 1);
  assert.equal(
    sizeRegressions([{ ...base, baselineGzip9: 1000, candidateGzip9: 1129 }])
      .length,
    1,
  );
});

test('opt-outs cannot hide full-featured regressions or missing results', () => {
  assert.equal(
    sizeRegressions([
      { ...base, candidateBrotli11: 17000 },
      { ...base, flavor: 'web-no-shared', candidateBrotli11: 100 },
    ]).length,
    1,
  );
  assert.throws(() => sizeRegressions([]), /Missing/);
  assert.throws(() => sizeRegressions([{ ...base, candidateBytes: NaN }]));
});

test('report rejects mixed baseline revisions', () => {
  assert.throws(
    () => renderReport({ baseline: 'a' }, { baseline: 'b' }),
    /Baseline/,
  );
});
