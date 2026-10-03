# Independent review of #5180 CodeQL alerts

Reviewed the open draft PR head `dc61543814fd4a4706608e8b3d3fe34169f7532b` on 2026-10-03. Both alerts are genuine unsafe file access in the new local repro fixture. They are not findings in the production `IndependentSharedPlugin` implementation. The three-line local proposal removes the request-derived filesystem path; no live PR source or remote state was changed.

## Exact alerts and dataflow

The aggregate [CodeQL check 111091889764](https://github.com/module-federation/core/runs/111091889764) completed with failure at this head, reporting two new high severity security vulnerabilities. JavaScript analysis `1884539322` (CodeQL 2.27.1; created 2026-10-03T01:02:57Z) has two results and no analysis error. Python and Actions analyses have zero results. Successful analysis jobs do not mean this aggregate alert gate passed.

| Alert                                                                        | Rule                            | Source                                                    | Sink                                       |
| ---------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| [#233](https://github.com/module-federation/core/security/code-scanning/233) | `js/path-injection`, high, open | `tools/repros/composed-shared-fallback.cjs:19`, `req.url` | Same file line 20, `fs.existsSync(file)`   |
| [#234](https://github.com/module-federation/core/security/code-scanning/234) | `js/path-injection`, high, open | Same source                                               | Same file line 25, `fs.readFileSync(file)` |

The rule's displayed name is “Uncontrolled data used in path expression.” Both SARIF flows are `req.url` → `.split('?')[0]` → `path.join(dir, 'dist', ...)` → `file` → filesystem sink. `split('?')` removes a query suffix but does not constrain path traversal. `existsSync` is not a directory boundary check. The filtered original two-result SARIF is retained in `skeptical-review-evidence/codeql5180/sarif-alerts.json`; it includes the source, intermediate steps, and sinks.

The server binds an ephemeral port on `127.0.0.1` at line 47 and closes in `finally`. This limits reachability and lifetime to a transient local fixture. However, an arbitrary local incoming request while the fixture is running controls `req.url`; it is not restricted to the SDK's fixed expected URL. Literal `..` segments can escape `dist` and read files accessible to the process. The relevant attacker is an unprivileged local client capable of supplying a raw request target. Browser URL construction can normalize dot segments before sending a request, so a normalized browser request is not equivalent to that raw input. The offline proof establishes the handler behavior for raw request URLs; it does not claim an executed network attack or externally reachable production exposure.

## Attribution and actual callback reproduction

Commit `8369865855c304b9e17136293f56490d03d2b5e1` introduced the entire fixture and unsafe handler. The handler is unchanged between that commit and `dc6154381`. The later commit improved the literal zero-async-chunk and actual fallback assertions. Neither alert is an old production bug or an introduced production public-path regression.

The proof captures the exact `http.createServer` callback from the checked-in script and invokes it with fake request/response objects. It does not execute the script, start a listener, compile webpack, or read unrelated host files. Filesystem wrappers restrict probe access to its own temporary fixture. A harmless sentinel is deliberately placed outside that fixture's `dist` subdirectory.

The baseline callback returns HTTP 200 and the outside sentinel for both `/../outside.txt` and `/independent-packages/../../outside.txt`. It also serves an unrelated `dist/main.cjs`. These are executable confirmations of the unsafe route, rather than an inference from the CodeQL rule alone. Encoded traversal strings are not decoded by this handler and return 404 in the baseline; the defect does not require encoding.

The earlier parent-owned actual fixture log `shared-publicpath-main-after.log` records the required URL as `/independent-packages/shared_lib/1.0.0/share-entry.js`, fallback value `secondary-shared-fallback`, and `nonInitialChunks: 0`. The initial offline review used that existing evidence; the subsequently approved independent real HTTP run below confirms the corrected proposal.

## Minimal isolated proposal

Local branch: `proof/publicpath-codeql-local`. Worktree: `/Users/zackjackson/Documents/Codex/2026-10-02/task-4/publicpath-codeql-proposal`. Base: exact `dc61543814fd4a4706608e8b3d3fe34169f7532b`. The parent-authorized local proposal is committed as `663c8f39274ebd1198cdae57702b62066a697778`, with only three insertions and two deletions, and remains unpushed. Both this worktree and the original/live `publicpath` worktree have clean status.

Only `tools/repros/composed-shared-fallback.cjs:19-21` changes:

```js
const asset = 'independent-packages/shared_lib/1.0.0/share-entry.js';
const file = path.join(dir, 'dist', asset);
if (req.url?.split('?')[0] !== `/${asset}` || !fs.existsSync(file)) {
```

The existing 404 response and `readFileSync` then use only the fixed trusted path. The request URL participates in the route comparison, never in the filesystem path. A query suffix remains compatible. Unknown routes, literal traversal, encoded traversal/slashes, and missing URLs return 404. No generic resolver or URL decoding is introduced.

The offline proof passes all eight proposed-handler cases: expected asset, expected asset with query, literal traversal, nested traversal, encoded traversal, encoded slash traversal, unrelated emitted asset, and missing URL. Its only read target is the fixed expected asset. It also asserts that every byte from `let compiler;` onward is unchanged, retaining the zero-async-chunk assertion, real shared fallback getter, discovery import, compiler configuration, runtime checks, and cleanup. The live `publicpath` worktree remains clean.

## Commands, evidence, and limits

Read-only GitHub commands used `gh api` for:

- `repos/module-federation/core/check-runs/111091889764`, selecting status, conclusion, head SHA and output summary.
- The same check's `/annotations`, selecting source locations and messages.
- `-X GET repos/module-federation/core/code-scanning/alerts -f ref=refs/pull/5180/head -f state=open`, selecting alert IDs, rules, locations, and commit.
- `-X GET repos/module-federation/core/code-scanning/analyses -f ref=refs/pull/5180/head`, selecting analysis IDs, timestamps, counts, and errors.
- `repos/module-federation/core/code-scanning/analyses/1884539322 -H 'Accept: application/sarif+json'`, piped through `skeptical-review-evidence/codeql5180/filter-sarif.py` to retain only the two fixture results.

Local validation commands (run from task root):

```sh
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/codeql5180/handler-proof.cjs
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/codeql5180/handler-proof.cjs publicpath-codeql-proposal/tools/repros/composed-shared-fallback.cjs
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node --check publicpath-codeql-proposal/tools/repros/composed-shared-fallback.cjs
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node publicpath/node_modules/prettier/bin/prettier.cjs --check publicpath-codeql-proposal/tools/repros/composed-shared-fallback.cjs
git -C publicpath-codeql-proposal diff --check
git -C publicpath status --short
```

All final validation commands passed. Logs: `baseline-handler.log`, `proposal-handler.log`; reviewable base-to-commit source patch: `proposal.patch`, all under `skeptical-review-evidence/codeql5180/`. The actual handler harness is retained there as `handler-proof.cjs`. After the parent requested a local commit, `git -C publicpath-codeql-proposal add tools/repros/composed-shared-fallback.cjs` staged only this file. The initial `HUSKY=0 git ... commit` failed because `.husky/_/husky.sh` is absent in the fresh isolated worktree. The final command was `git -C publicpath-codeql-proposal -c core.hooksPath=/dev/null commit -m 'test(enhanced): constrain shared fallback fixture route'`; this per-command hook bypass did not change stored Git configuration. The full formatting hook was skipped; the changed-file Prettier check had already passed. `git -C publicpath-codeql-proposal diff dc61543814fd4a4706608e8b3d3fe34169f7532b HEAD --check` also passed, and both worktree status checks were empty.

Local navigation used Ripwire for source flow and Prettier dependency inspection, plus `rg`, direct file reads, and `git show`/`git diff` for exact attribution. Read-only command failures: the first sandboxed GitHub request could not connect; authorized network-escalated read-only requests succeeded. Ripwire rejected unsupported combinations (`--limit` on its default map, repeated grep flags, and `--max-tokens` with regex pagination); corrected single-regex paginated calls succeeded. A report filename lookup was absent. The first offline proof had a one-directory-too-high baseline path and failed with ENOENT; the harness path was corrected before the successful baseline and proposal runs. No automatic approval rejection occurred and no credentials or raw header logs were read or published.

The initial review did not run HTTP because the parent prohibited service activation. The subsequent authorization and successful run are recorded below. No fresh full builds, new dependency installation, full-repository format gate, or remote CodeQL rerun were performed. Only fixture routing changed and file formatting passed. No alerts were dismissed, stored permissions/settings/CI were changed, commits were pushed, or PRs were merged.

## Subsequently authorized real HTTP regression

The parent explicitly approved running the real temporary loopback fixture after accepting the local correction, superseding the earlier no-listener restriction for this fixture. The checked-in #5180 subprocess test uses `MF_REPRO_LEGACY=1`; this review uses the same mode, which tests the actual production main branch rather than the separate RFC composed-runtime control.

Reused verified existing artifacts through the script's supported `MF_REPRO_BUILD_ROOT` environment variable. No dependency symlinks, installation, rebuild, or lockfile changes were needed. `artifact-provenance.cjs` independently confirms:

- Build checkout `publicpath` is clean at exact `dc61543814fd4a4706608e8b3d3fe34169f7532b`; proposal checkout is clean at `663c8f39274ebd1198cdae57702b62066a697778`.
- All package sources, package manifests, lockfile, Turbo configuration, and root TypeScript configuration are identical across those heads.
- The actual built `IndependentSharedPlugin.js.map` contains source byte-identical to the committed production `IndependentSharedPlugin.ts` at `dc615`. Its JavaScript includes the added `RuntimeGlobals.publicPath` requirement. Artifact/map/lockfile SHA-256 hashes are captured in `artifact-provenance.log`.

Commands (HTTP command executed with cwd `publicpath-codeql-proposal`):

```sh
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/codeql5180/artifact-provenance.cjs
MF_REPRO_LEGACY=1 MF_REPRO_BUILD_ROOT=/Users/zackjackson/Documents/Codex/2026-10-02/task-4/publicpath /Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node --require /Users/zackjackson/Documents/Codex/2026-10-02/task-4/skeptical-review-evidence/codeql5180/http-cleanup-observer.cjs tools/repros/composed-shared-fallback.cjs
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/codeql5180/handler-proof.cjs publicpath-codeql-proposal/tools/repros/composed-shared-fallback.cjs
```

The actual HTTP process exits 0. `real-http-regression.log` records one literal request, `/independent-packages/shared_lib/1.0.0/share-entry.js`, and result `secondary-shared-fallback`. The exact existing literal assertion reports `nonInitialChunks: 0`; the discovery import and actual fallback getter execute unchanged. Legacy telemetry correctly reports `remoteDisabled: false`, `platformNodeModule: false`, and full legacy runtime capabilities; no composed-runtime graph claims are inferred from this run.

The preload observer only records actual directory creation and server listening/close events; it does not replace the handler, compiler, listener, or cleanup behavior. It confirms one ephemeral IPv4 listener at `127.0.0.1:64869`, then a close event, one fixture temporary directory created, and zero remaining. The offline handler rerun again passes all eight cases and compiler/assertion suffix byte identity (`proposal-handler-after-http.log`).

The first sandboxed attempt failed with `listen EPERM` before compilation. Its unhandled listener error bypassed the fixture's normal final cleanup, leaving only our own `mf-shared-platform-IWQmXX` directory with generated `src` files. It was explicitly removed with `fs.rmSync` of that exact path. The authorized network-escalated retry passed and performed normal cleanup. The failed run is retained separately in `real-http-sandbox-denied.log`; no automatic approval review rejection occurred. Additional lookup failures were an absent guessed test location and an unmatched shell glob; the actual test was located under `test/compiler-unit/sharing/sharedFallbackPublicPath.test.ts` and read successfully.

Remote CodeQL was not rerun. Its live-head alert clearance remains unverified; the corrected local HTTP behavior and offline path gate are now verified.

Recommendation: accept the bounded local route correction for parent review and authorized integration; retain the current CodeQL failure on the live head as an unresolved gate until the proposal is applied and checked.
