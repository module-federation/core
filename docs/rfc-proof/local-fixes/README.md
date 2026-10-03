# Local fixes and review evidence

2026-10-03: [The reviewed RFC5128 metadata alternative is now implemented and verified locally](../metadata-implementation/README.md). Its source pushes remain held; the linked patches and final minor/major evidence supersede the earlier metadata proposal/pending status. Earlier reports remain historical snapshots.

Three bounded source fixes are committed locally and verified. Source and PR pushes remain held because PR synchronization triggers package/website previews. Only this evidence branch is published. RFC5128 metadata admission remains incomplete and its implementation awaits the parent's independent review.

## Review deliverables

- [RFC5128 metadata source/API proposal](rfc5128-metadata-integration-proposal.md): reuses the existing seven-field v1 descriptor and exact union comparison semantics, treats only undefined as absence, preserves the warning/allow legacy policy, and specifies a guard before external dereference. No metadata implementation or new registry is included.
- [Exact two-file externalization production diff](rfc5128-externalization-production.patch) and [reviewed hashes](review-snapshot.json).
- Complete focused changesets and regressions: [RFC5036 patch](rfc5036-complete-source.patch), [RFC5128 patch](rfc5128-complete-source.patch), [#5180 patch](codeql5180/proposal.patch). The first two patches use zero context; apply with `git apply --unidiff-zero` against the recorded parent source.
- [All fourteen local heads](RFC_LOCAL_FIXES_FINAL_MANIFEST.json), [5036 propagation](RFC5036_IMAGE_SHAPE_LOCAL_PROPAGATION.json), and [5128 propagation](RFC5128_EXTERNAL_KERNEL_LOCAL_PROPAGATION.json). All are clean and retain original/updated-parent ancestry. Eleven links changed in this follow-up; the first three 5036 links remain unchanged. The earlier public proof heads remain unchanged.

| Fix                           | Local focused commit                       | Final local tip                                                                                    | Verified result                                                                                                                                                         |
| ----------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RFC5036 descriptor validation | `13e83755eba6b461161cb47e747343bdb9a3894c` | #5107 `d3d52a0cc28e8a6fef0d6698f5876ac5804285b3`                                                   | Existing v1 comparisons preserved; malformed/unknown-version metadata rejects before mutation, including first publication. Undefined legacy absence remains supported. |
| RFC5128 external kernel       | `7aca6f70d415d110dd5419ace5b4c6a566c902c9` | #5141 `7af25cdb9243eb8556d18ec451fce9973b6a0cfb`; #5142 `9a5c81b05ae0ab16f7858fa877ab3073e48b218b` | Exact kernel adapter projects actual provider exports; unsupported subpaths reject. Three real Rspack versions emit zero core modules in external consumers/containers. |
| #5180 fixed HTTP route        | `663c8f39274ebd1198cdae57702b62066a697778` | Live draft remains `dc61543814fd4a4706608e8b3d3fe34169f7532b`                                      | Real HTTP executes the expected shared fallback, zero non-initial chunks, and complete temporary listener/directory cleanup. Eight offline route cases pass.            |

Local source commits have not been pushed, so their identifiers are provenance rather than clickable GitHub commits. Source patches include the complete changes required for review.

## Commands and executed scope

Node24.15.0 / pnpm10.28.0, in the corresponding isolated final checkout:

```sh
# RFC5036 final #5107
corepack pnpm exec turbo run build --filter=@module-federation/runtime --filter=@module-federation/inject-external-runtime-core-plugin --concurrency=4 --force
corepack pnpm --filter @module-federation/runtime-core run test
corepack pnpm --filter @module-federation/runtime run test
corepack pnpm --filter @module-federation/inject-external-runtime-core-plugin run test
corepack pnpm exec prettier --check .
# RFC5128 final #5141 and #5142, each
corepack pnpm --filter @module-federation/rspack run build
corepack pnpm --filter @module-federation/rspack run test
corepack pnpm exec prettier --check .
```

5036: forced **7/7 build tasks**, **199 core / 105 runtime / 17 injector tests**, full formatting pass. Three actual compilations and eleven fresh processes prove one compatible execution, seven incompatible peer rejections, and three invalid first-publication rejections; core/info slot references and existing registry/shared state are preserved. Additive `parseRuntimeImage` API negative type proof passes. [Report](rfc5036-runtime-image-shape-proof-report.md), [actual process manifest](rfc5036-image-shape-final-proof-manifest.json).

5128: both package builds/full formatting pass; minor **34 tests / 5 suites**, major **38 / 5**, zero skips. Standalone actual Rspack **2.1.10, 1.7.9, 1.5.8**: twelve compile attempts and sixteen fresh startup processes, provider/container/consumer core counts `[40,0,0]`. The exact original wrapper fails with `[40,40,40]`. Shared/file-container/native SDK data-URL literals and constructor identities execute; missing exports/malformed registry reject without mutating retained state. [Report](rfc5128-external-kernel-proof-report.md), [graphs and row logs](rfc5128/).

#5180: the approved temporary IPv4 loopback run uses the checked-in legacy test mode and exact existing production artifacts; it is not a composed-runtime claim. [Report and exact HTTP/offline commands](codeql5180-review.md), [HTTP log](codeql5180/real-http-regression.log), [eight route cases](codeql5180/proposal-handler-after-http.log), [artifact provenance](codeql5180/artifact-provenance.log).

Full commands, fixture harness paths, historical diagnostics, baseline replays and skipped scope are in the reports. Final build/test/format logs are under [logs](logs/). Ripwire navigation covers [repository source](ripwire-external.xml) and [actual installed Rspack modules](ripwire-installed-rspack.xml).

## Failed gates and unrun scope

- RFC5128 metadata acceptance remains an open gap. The source/API proposal is reviewable but deliberately unimplemented pending independent review; zero bundled core modules does not prove metadata admission.
- Strict final built-export ESM and CJS consumers pass individually. Their combined no-skipLibCheck program still fails with **four preexisting TS2403 global declaration errors**. [Consumers, results and logs](rfc5036-strict-consumers/).
- Whole-core library type check retains **two TS2322 preload-signature errors**, reproduced identically at the unmodified 5036 owning-link baseline. API-focused negative type checks pass; these do not supersede the whole-library failure.
- Sandbox listener attempts failed for 5036 tests and #5180 HTTP, and the first major Rspack suite stalled under listener restrictions. Retained failed logs are separate from approved per-command listener retries, which passed. Missing app-only Tailwind formatter dependencies initially prevented full formatting; full locked installation and final formatting now pass without source/lock changes. No automatic approval rejection occurred.
- Existing Rspack Publint ambiguous import declaration warning remains. Browser external-provider execution, custom external transports, Vite8 optimizeDeps, full workspace/app/Metro/E2E and new remote CI/CodeQL clearance remain unrun. The live #5180 CodeQL alerts are not cleared by this local proof. Historical optimizer/bootstrap scope is retained in the preceding ledger, not extended implicitly by these fixes.

No PR merge, source push, package publication, deployment, credential or settings change occurred in this phase. No unrelated work or Open Tap was touched. This branch contains reports, patches and proof evidence, with no tarballs, emitted bundles, node_modules, secrets or raw deployment headers. Published log copies trim trailing whitespace and blank EOF lines; raw originals remain in the task workspace.
