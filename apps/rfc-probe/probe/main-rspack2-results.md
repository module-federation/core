# main-rspack2: legacy runtime on @rspack/core 2.1.8 (like-for-like rspack baseline)

Label `main-rspack2` in run.mjs: /fast/worktrees/rfc-probe-main detached at 6bd7ea0aa (the prototype's base; differs from origin/main only by dependency bumps outside the runtime packages), runtime packages rebuilt there (sdk, runtime-core, runtime, webpack-bundler-runtime, runtime-tools; log build-main-rspack2.log). Engine: the same @rspack/core 2.1.8 dist the `composed` label uses. No ESM alias knob, so the native MF plugin consumes the CJS entries (`webpack-bundler-runtime/dist/index.cjs`, `runtime-core/dist/index.cjs`). Profiles are the probe's PROFILES; `remotes-only` is plain MF options (one remote, `experiments.optimization { disableShared, disableSnapshot, target: 'web' }`), identical for both labels. Run log: run-main-rspack2.log.

Absent = implementation markers missing. `graph` = module not in any emitted chunk, `emitted` = marker string not in emitted JS. Markers: shared, remote, module, snapshot, preload, container, sdknode (see results.md).

Composed numbers are from composed-results.md (commit 03aa956e2, kernel split only). The last column is the `composed` rerun at 5f580d4f5 (kernel split + slots/attach, the branch's current HEAD) done while verifying the restore.

| profile | mode | main-rspack2 bytesMain | main-rspack2 absent (graph / emitted) | composed bytesMain (03aa956e2) | composed absent (graph = emitted) | delta | composed @ 5f580d4f5 |
|---|---|---|---|---|---|---|---|
| ALL-OFF | M1 | 107,010 | none / sdknode | 19,542 | all 7 | -81.7% | 21,274 |
| ALL-OFF | M2 | 241,371 | none / sdknode | 66,422 | all 7 | -72.5% | 69,719 |
| ALL-OFF | M3 | 260,454 | none / sdknode | 130,108 | all 7 | -50.0% | 136,404 |
| ALL-OFF | M3+se | 241,358 | none / sdknode | 83,085 | all 7 | -65.6% | 89,239 |
| remotes-only | M1 | 107,440 | none / sdknode | 57,775 | shared, snapshot, preload, container, sdknode | -46.2% | 58,782 |
| remotes-only | M2 | 242,098 | none / sdknode | 156,337 | shared, snapshot, preload, container, sdknode | -35.4% | 158,609 |
| remotes-only | M3 | 261,181 | none / sdknode | 229,649 | shared, snapshot, preload, container, sdknode | -12.1% | 233,110 |
| remotes-only | M3+se | 242,085 | none / sdknode | 195,729 | shared, snapshot, preload, container, sdknode | -19.1% | 199,189 |
| DEFAULT | M1 | 117,729 | none / none | 83,975 | sdknode | -28.7% | 84,652 |
| DEFAULT | M2 | 249,360 | none / none | 205,634 | sdknode | -17.5% | 207,407 |
| DEFAULT | M3 | 249,116 | none / none | 257,563 | sdknode | +3.4% | 259,591 |
| DEFAULT | M3+se | 249,116 | none / none | 243,289 | sdknode | -2.4% | 245,313 |

In main-rspack2 every capability module is in the chunk graph in every cell (79 federation modules, 0 orphans); the disable flags only drop the sdk Node loader's marker string in ALL-OFF and remotes-only. remotes-only is within 0.4% of ALL-OFF because the flags do nothing through the CJS entries.

## How much of the rspack drop is composition vs rspack version vs CJS/ESM entry

The rspack version is close to nothing: the legacy CJS build goes from 107,387 to 107,010 bytes (ALL-OFF M1, -0.35%) and from 118,131 to 117,729 (DEFAULT M1, -0.3%) between @rspack/core 1.3.9 (`main` label) and 2.1.8 (this label), so the old RFC table's rspack "main" column overstates the baseline by under 0.5%. The CJS-to-ESM entry is the large share of the ALL-OFF drop: on 1.3.9, the ESM alias knob alone takes legacy ALL-OFF M1 from 107,387 to 49,582 (`main-rspack-esm`, -54%) and DEFAULT M1 from 118,131 to 89,400 (-24%), because the defines can only dead-code-eliminate through ESM. Composition does the rest: 49,582 to 19,542 in ALL-OFF M1 (about 30 KB, and the only step that removes the capability modules from the graph rather than just their minified bodies), and about 5.4 KB in DEFAULT M1 (89,400 to 83,975). So of the 87.5 KB ALL-OFF M1 drop from main-rspack2 to composed, about 57.8 KB is the ESM entry and about 30 KB is composition (the 0.3 KB overshoot is the 1.3.9-vs-2.1.8 step inside the ESM estimate); the 0.4 KB rspack version effect is now out of the comparison. Caveat: the ESM-only legacy step was measured on 1.3.9, not 2.1.8. Given the 0.3% CJS version gap, that should not move the split much, but a `main-rspack2-esm` cell (rspackEsm plus the 2.1.8 core) would remove the cross-version step. No legacy ESM remotes-only cell exists, so remotes-only (-46% at M1) cannot be split the same way.
