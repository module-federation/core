# Runtime core performance checks

`Runtime Core Performance` compares runtime-core and selected enhanced compiler
plugins against the pull request base, in one Ubuntu 24.04 job. It runs on
relevant changes and supports manual dispatch with a baseline revision.

The production changes preserve the runtime's live remote list and configuration
order. Large compiler remote lists use an index of configuration ordinals, so
the first configured match still wins. Semver reuses ten fixed regular
expressions without retaining user ranges or mutable shared resolution results.
Public APIs, plugins and feature defaults are unchanged.

## Run locally

Use Node 24 and the repository's pnpm version. Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/runtime-core --filter=@module-federation/enhanced --concurrency=4
mkdir -p tmp/runtime-performance/profiles
node tools/scripts/benchmark-runtime-dod.mjs --baseline origin/main --rounds 7 --output tmp/runtime-performance/performance.json --profile-dir tmp/runtime-performance/profiles
node tools/scripts/measure-runtime-footprint.mjs --baseline origin/main --output tmp/runtime-performance/size.json
node --test tools/scripts/report-runtime-dod.test.mjs
node tools/scripts/report-runtime-dod.mjs tmp/runtime-performance/performance.json tmp/runtime-performance/size.json tmp/runtime-performance/report.md
```

Build before measuring; do not run builds or other benchmarks concurrently.
The harness extracts baseline sources with `git archive` and uses installed,
built dependencies from the current checkout for both variants. It isolates
runtime-core and the three measured compiler plugin files. It does not measure
changes to other dependencies or toolchain versions.

## What is measured

- Seven rounds of A/A and A/B, with four serial fresh Node processes per round.
  A/A runs identical baseline bundles. Pair order reverses each round.
- Runtime matching and real `loadRemote` calls with 1, 10, 100 and 1,000 remotes,
  including names, aliases, misses, boundary mismatches and observer plugins.
- Cold runtime module evaluation and first instance setup with 10 remotes,
  20 shared packages, three versions per package and five observer plugins.
  Shared loading, first remote loading and a cached call are timed separately.
- Repeated instance initialization and mixed semver comparisons. Individual
  semver outcomes are compared across revisions before timing, including
  prereleases, invalid inputs and OR ranges.
- Actual webpack remote factorization, compiler setup and full fixture builds.
  Build output hashes and scenario checksums must agree across variants.
- Actual consume/provide hooks with 1–1,000 shared prefixes, measuring unmatched
  requests without filesystem resolution. These are diagnostic controls;
  shared prefix implementation changes are not included in this optimization.
- Separate V8 CPU profiles of repeated instance initialization, readable in
  Chrome DevTools. Profiling overhead is excluded from measured comparisons.

The runtime fixture uses raw in-memory containers. It measures Node CPU time,
not network latency, browser startup, rendering or application execution.
Startup total sums runtime module evaluation, host initialization, shared
loading and first remote loading. It excludes fixture preparation and raw
container registration. Repeated initialization includes that setup and uses
warmed code; it is not a cold-start metric.

## Interpretation and gates

CPU timing is advisory. The report includes median, IQR, paired improvement,
faster-pair count and the 95th percentile of absolute A/A changes. The label
“faster than observed A/A noise” requires at least five pairs, an improvement
larger than observed noise and at least 80% faster pairs. This is descriptive,
not a statistical significance test. Do not infer whole-page or whole-build
gains from microbenchmarks.

Footprint checks rebuild runtime-core using the repository tsdown configuration
and bundle complete browser dependency closures with both webpack and esbuild.
They cover runtime-core, runtime, createInstance-only and bundler-runtime
entries, record raw/gzip-9/Brotli-11 bytes, and repeat web-full builds to check
determinism. Feature opt-outs are separate diagnostic scenarios.

The size gate covers every measured full-featured scenario. Allowed growth is
the larger of 1% or 1,024 raw bytes, and the larger of 1% or 128 compressed bytes.
This tolerates small compressor changes while rejecting material growth.
Outputs, checksums, environment versions, raw samples and profiles are uploaded
as the `runtime-performance` artifact; the comparison appears in the job summary.

The existing package build/test workflows continue to validate functionality.
This workflow has read-only repository permissions and does not post comments
or run releases.
