# Local RFC 5128 external-kernel fix

Commit: `7aca6f70d415d110dd5419ace5b4c6a566c902c9`, isolated branch `proof/rfc5128-external-kernel`, worktree `/Users/zackjackson/Documents/Codex/2026-10-02/task-4/rfc5128-external-kernel`. Parent is the final kernel-base link `ca0b6188f` (#5135). No remote/source push, integrated-worktree mutation, metadata implementation, service, or persistent permission/settings change was performed.

The parent subsequently propagated this commit through seven links locally: final minor `7af25cdb9243eb8556d18ec451fce9973b6a0cfb`, final major `9a5c81b05ae0ab16f7858fa877ab3073e48b218b`. These are propagation provenance, not the executed matrix heads below. The parent owns their ongoing builds, package tests, and full formatting checks; no duplicate builds were started. The isolated worktree remains clean at the proof commit, and the two production source hashes below remain unchanged after review.

## Ownership and change

Commit `8fc7ade87` in #5135 introduced `runtime/src/instance.ts` with runtime-core/kernel imports. Commit `1b3250f26` in #5137 added kernel imports in bundler-runtime helpers. Thus #5135 is the earliest owning link for the root-only externalization defect. The existing Rspack wrapper externalized only exact `@module-federation/runtime-core`; `/kernel` require exports resolve to `dist/index.cjs`, bundling another full core.

The fix changes two production files: `rspack/src/ExternalRuntimePlugin.ts` and its installation in `rspack/src/ModuleFederationPlugin.ts`. With `externalRuntime:true`, a `NormalModuleReplacementPlugin` replaces only the exact kernel request with a real ESM data module. It reads the existing root external, validates a non-array object namespace, four callable kernel exports, `CurrentGlobal`, and its non-array federation registry with an instance array, then projects the five actual kernel exports. It fabricates no functions and preserves their provider identities. Core minimum shape is independent of metadata absence.

The root's existing external transport remains selected by `compiler.options.externalsType || 'global'`. No public root/kernel export is added or changed. The five-export adapter matches the existing kernel interface; the actual root and kernel require namespaces are reference-equal today, as verified against built artifacts by `namespace-proof.mjs` and recorded in `namespace.json`.

Other runtime-core subpaths under externalRuntime now fail compilation with `[ExternalRuntimeNamespace]` instead of being mapped to a provider that lacks their exports. This is a compatibility impact for users who previously combined external core with bundled core subpaths; it is scoped to the explicit external-runtime mode and documented in the patch changeset. Ordinary/composed leaf imports are not rewritten, and provider-only builds retain their own core. Absolute file imports or separately supplied user externals are outside this bounded request-namespace fix.

Production SHA256 hashes match the parent's reviewed evidence snapshot `d52ec3cd4232de27a4ca6269747addda894674bd`:

- `ExternalRuntimePlugin.ts`: `cf8f08a98129cb218c93d0dadaac3ba81f8af32eecd00c63323cf4d2fe3e405e`
- `ModuleFederationPlugin.ts`: `a6e43d54ec47c2000657c87b64b839ad6cb2e64b35e1aa2fe3710b5dd6875304`

Exact diff: `production.patch`. The commit additionally contains the changeset and three checked-in test files: namespace-contract unit cases, the actual compiler/process harness, and its package-suite runner.

## Executable proof

The original owning-link ModuleFederationPlugin was temporarily restored and built through its real package build in this isolated worktree. The new checked-in fixture failed its zero-core assertion with actual provider/container/consumer core counts `[40,40,40]`. The fix was restored immediately afterward. `baseline/graphs.json` and `baseline.log` preserve that red result; no source replacement/transpiler stand-in was used.

The corrected wrapper has `[40,0,0]` core modules in actual emitted provider/container/consumer chunk graphs on all three installed Rspack versions. Every variant compiles an actual provider, an external file container, and an external consumer; a fourth compile intentionally imports unsupported core/shared and must fail with its named request context.

| Rspack | Core counts | Fresh startup processes | Result                                         |
| ------ | ----------- | ----------------------: | ---------------------------------------------- |
| 2.1.10 | `[40,0,0]`  |                       6 | compatible execution + 5 named rejection cases |
| 1.7.9  | `[40,0,0]`  |                       5 | compatible execution + 4 named rejection cases |
| 1.5.8  | `[40,0,0]`  |                       5 | compatible execution + 4 named rejection cases |

Compatible startup asserts actual provider and consumer non-null instances, actual constructor equality with the published core and `instanceof`, `shared-provider-literal`, `remote-file-literal`, consumer/container shared object identity, and `runtime-data-url-remote-literal` from consumer.instance.loadRemote through the real Node SDK fetch/evaluator. No HTTP listener or mock constructor/runtime is used.

Emitted negative cases reject missing provider, missing FederationKernel, malformed global registry, and missing getRemoteEntry with `[ExternalRuntimeKernelContract]`. The 2.1.10 run additionally supplies the actual historical packed core from `packed-enhanced-bootstrap/compilers/old`, source `94aa84631`; its absent FederationKernel produces the named rejection despite its package name/version. Each negative snapshots the external core after deliberate bad-payload injection, preserves that exact reference and `_FROM`, and checks existing instance-array contents and nested shared state remain unchanged. The missing-provider case has no preexisting registry to snapshot; it asserts publication identity only and does not claim a valid registry was present.

Totals across the three standalone compiler runs: 12 compile attempts (9 success + 3 expected unsupported-namespace failures), 16 fresh processes (3 successful execution + 13 expected rejections). The full package suite also independently executes the 2.1.10 five-process fixture and passes **17 tests across 3 suites**, with no skips. Declarations and package build pass. The source owns no new native VirtualModulesPlugin dependency; the adapter executes through NormalModuleReplacementPlugin/data modules on 1.5.8, 1.7.9, and 2.1.10.

Artifacts: `fixed.log`, `fixed/graphs.json` and row logs; `rspack-1.5.8.log` / `rspack-1.5.8/graphs.json`; `rspack-1.7.9.log` / `rspack-1.7.9/graphs.json`; `namespace.json`; baseline artifacts above. Generated bundles are under each proof directory's `out/` and are local evidence, not intended for public publication.

## Commands and checks

All package commands use Node 24.15.0 and corepack pnpm 10.28.0 from the isolated worktree:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
corepack pnpm --filter @module-federation/rspack... install --frozen-lockfile
corepack pnpm exec turbo run build --filter=@module-federation/rspack... --force --concurrency=4
corepack pnpm --filter @module-federation/rspack build
corepack pnpm --filter @module-federation/rspack test
corepack pnpm exec prettier --check .
corepack pnpm exec prettier --check packages/rspack/src/ExternalRuntimePlugin.ts packages/rspack/src/ModuleFederationPlugin.ts packages/rspack/__tests__/ExternalRuntimePlugin.spec.ts packages/rspack/__tests__/externalRuntime.spec.ts packages/rspack/__tests__/external-runtime-fixture/probe.mjs .changeset/fix-external-kernel.md
git diff --check
```

Standalone 2.1.10 with the historical provider namespace:

```sh
PROOF_OLD_CORE_PATH=/Users/zackjackson/Documents/Codex/2026-10-02/task-4/packed-enhanced-bootstrap/compilers/old/node_modules/@module-federation/runtime-core/dist/index.cjs node packages/rspack/__tests__/external-runtime-fixture/probe.mjs build /Users/zackjackson/Documents/Codex/2026-10-02/task-4/rfc5128-external-kernel-proof/fixed
```

Standalone older cores, with the same built wrapper and runtime family:

```sh
PROOF_RSPACK_CORE_PATH=/Users/zackjackson/Documents/Codex/2026-10-02/task-4/stack5141/node_modules/.pnpm/@rspack+core@1.5.8_@emnapi+core@1.11.3_@emnapi+runtime@1.11.3_@swc+helpers@0.5.17/node_modules/@rspack/core node packages/rspack/__tests__/external-runtime-fixture/probe.mjs build /Users/zackjackson/Documents/Codex/2026-10-02/task-4/rfc5128-external-kernel-proof/rspack-1.5.8
PROOF_RSPACK_CORE_PATH=/Users/zackjackson/Documents/Codex/2026-10-02/task-4/stack5141/node_modules/.pnpm/@rspack+core@1.7.9_@swc+helpers@0.5.23/node_modules/@rspack/core node packages/rspack/__tests__/external-runtime-fixture/probe.mjs build /Users/zackjackson/Documents/Codex/2026-10-02/task-4/rfc5128-external-kernel-proof/rspack-1.7.9
```

Namespace proof from task root: `node rfc5128-external-kernel-proof/namespace-proof.mjs`. Local Ripwire was used for repository and actual @rspack/core node_modules navigation, including `--for='externalRuntime root namespace kernel external runtime provider exports'` on the final Rspack source and `--for='NormalModuleReplacementPlugin external callback module request data URI'` on the installed 2.1.10 dist directory.

Setup diagnostics: offline frozen install failed because the locked store lacked vue-tsc2.2.12 and other tarballs; the default sandboxed online attempt failed registry resolution. The same frozen command succeeded with authorized command-level network escalation. No lockfile or graph replacement was made. Initial declaration generation found an undeclared direct runtime-core type import and null callback argument; deriving keys from the existing runtime-tools provider namespace and using undefined corrected both. Initial CJS adapter syntax was incompatible with the real Rspack data-module ESM parsing and emitted no usable exports; the actual execution failure led to the current real ESM adapter. A namespace audit initially attempted to resolve core directly from runtime-tools, whose dependency is indirect; it was corrected to resolve through runtime's declared dependency. These diagnostics were not weakened into passing tests.

The initial forced 13-package build passed its 12 dependencies and failed the wrapper declaration issues above; subsequent real wrapper builds/declarations pass. Full repository Prettier was attempted and exits 2 because 389 app files load the uninstalled app-only @tailwindcss/typography dependency in the filtered workspace. The scoped changed-file format check and diff check pass. No unrelated app dependencies or formatting were changed. Full logs are task-root `rfc5128-external-kernel-{install,build,build-followup,tests,format,scoped-format}.log`.

UNRUN: browser external-provider execution, custom externals transport types, and final minor/major reruns after parent propagation. Fixtures explicitly use `externalsType:'global'`; missing-provider named diagnostics are proved for that global-property transport, not for transport errors in other external types. Root owns local propagation and will trigger the final minor/major proof; integrated tips remained untouched during this fix. No metadata API/admission implementation is claimed.

## Metadata review deliverable

`metadata-integration-proposal.md` is available separately, published in the parent's evidence-only review snapshot. It reuses supported v1 fields and unchanged union comparisons; only undefined is absence; malformed or unknown-version input rejects before comparison; one missing counterpart retains the existing warning/allow policy. It specifies core minimum checks independently of metadata, pre-external-dereference ordering, and additive API/source impact for alternatives that do not currently ship v1. It contains no implemented metadata guard, new global registry, casts, or invented functions. Its captured pre-validation 5036 finding is baseline evidence; the parent has since fixed that validation locally and annotated the review snapshot accordingly.

## Final propagated minor and major verification

The root reviewed the two production files and verified both SHA256 hashes match the published `d52ec3cd4232de27a4ca6269747addda894674bd` review snapshot. The fix is locally propagated through all seven RFC5128 links, preserving original heads and updated-parent ancestry. Final minor is `7af25cdb9243eb8556d18ec451fce9973b6a0cfb`; major is `9a5c81b05ae0ab16f7858fa877ab3073e48b218b`. Both are clean. At #5141, Git conflicted only where the existing composition import and new external-runtime import occupy the same insertion point; both imports were retained. Six scoped files comprise the propagated change.

Commands in both final checkouts used Node24/pnpm10.28: `corepack pnpm --filter @module-federation/rspack run build`, `corepack pnpm --filter @module-federation/rspack run test`, and `corepack pnpm exec prettier --check .`. Both builds and full formatting gates pass. Full minor package suite passes **34 tests / 5 suites**, major **38 tests / 5 suites**, zero skips. The new checked-in compiled fixture is included in each suite, proving zero core modules in external consumer/container and real constructor/shared/file-remote/SDK-data-URL execution plus named negative namespace cases. Builds retain the package's existing ambiguous import declaration Publint warning and package-type suggestion; no unrelated packaging redesign was made.

The first minor full-format check failed because its filtered install lacked app-only `@tailwindcss/typography` (389 app files). The root completed `corepack pnpm install --frozen-lockfile --ignore-scripts` in that isolated checkout, using the existing locked packages with zero downloads; its full-format rerun passes and no tracked source/lock changes occurred. The first major full-suite attempt stalled in the unchanged composed HTTP tests under the bind-restricted sandbox. Only that task's test process tree was terminated and the partial log retained. The suite was rerun with the authorized temporary listener access and passed; minor's full suite used that access from the outset. Successful test runners have exited. No service configuration or stored permissions changed.

Logs use `rfc5128-external-kernel-final-{minor,major}-{build,tests}.log`, `*-format.log` (major), `*-format-complete.log` (minor), `*-full-install.log` (minor), and `*-tests-sandbox-failed.log` (major). The failed filtered-format log remains separate. Exact local propagation is `RFC5128_EXTERNAL_KERNEL_LOCAL_PROPAGATION.json`; all fourteen local stack heads and the preceding published proof heads are in `RFC_LOCAL_FIXES_FINAL_MANIFEST.json`. No source or PR pushes occurred. Metadata implementation remains held for the parent's review of the source/API proposal.
