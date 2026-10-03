# Compiler composition across installed enhanced copies

This proof builds the checkout, packs enhanced, and installs the tarball under two pnpm aliases with distinct package roots. A third installed tarball restores the two compiler modules from exact baseline SHA `84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec`, transpiled with the locked SWC dependency; its remaining runtime artifacts and dependency links match the local build. Two complete custom runtime families are copied from the built checkout. Their unrelated dependencies remain linked to the locked installation. The proof compiles real webpack bundles, captures the selected compiler-slot entry source and module graph, and executes compatible bundles to compare the federation instance seen by two entry modules.

From the repository root, after the locked dependency install in AGENTS.md, use Node 24 and corepack pnpm 10.28.0:

```sh
node tools/repros/composition-copies/run.cjs
```

The command builds enhanced and its workspace dependencies, installs both aliases offline, replays the generated consumer lock with `--frozen-lockfile`, and asserts the fixed behavior. It prints the temporary artifact directory containing `results.json`, emitted bundles, consumer lockfile, and installed copies. No remote dependencies are installed. `COMPOSITION_PROOF_DIR` optionally sets the artifact directory; `COMPOSITION_PROOF_REPO` optionally points at another already-installed checkout to build and test. `--observe-only` records behavior without asserting the fix and is useful on the baseline.

Compact captured outcomes are saved in [baseline-results.json](./baseline-results.json) and [fixed-results.json](./fixed-results.json); diagnostic artifact-directory prefixes are normalized.

Observed baseline: `84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec` (live PR #5141, originating compiler implementation in PR #5140).

| Case                                         | Literal baseline result                                                                          | Required fixed result                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Same custom family, A→B and B→A              | `errors=[]`, `warnings=[]`                                                                       | Both compile; one compose module, one kernel; two entry modules see the same non-null instance |
| Distinct custom families, A→B                | `errors=[]`, `warnings=[]`; entry source and graph select only family A                          | Reject `incompatible runtime families` before compilation                                      |
| Distinct custom families, B→A                | `errors=[]`, `warnings=[]`; entry source and graph select only family B                          | Same rejection in reverse order                                                                |
| Target web→node                              | `errors=[]`, `warnings=["DefinePlugin\nConflicting values for 'ENV_TARGET'"]`; graph selects web | Reject `incompatible targets`                                                                  |
| Target node→web                              | Same warning; graph selects node                                                                 | Same rejection in reverse order                                                                |
| Null, missing version, invalid version slots | Silently accepted                                                                                | Reject `Invalid module-federation.composition/1 compiler slot`                                 |
| Primitive or empty object slots              | `Cannot read properties of undefined (reading 'push')`                                           | Same clear protocol rejection                                                                  |

The default run also executes the old registration algorithm against a newly created slot and an old unversioned slot in both orders, checks malformed needs mutation in `afterPlugins`, and checks replacement after planner registration. It requires the same named protocol diagnostic before compilation.

The default run fails closed on any mismatch. Graph and runtime identity assertions are checks of the emitted artifact; a successful build alone is insufficient. The committed compiler regression suite additionally checks invalid participant, planner, entry, and sealed shapes. This harness makes no remote requests, merges, pushes, or release changes.

## Opt-out compatibility policy

When every federation options participant opts out, builds use the full runtime without consulting or enforcing the experimental slot protocol. Actual installed baseline/current copies in both orders compile with `errors=[]`, `warnings=[]`, have no compose module, and execute with the same instance identity. An old unversioned slot is left compatible with the legacy path.

For copies using the current protocol, mixed opt-in/opt-out settings select the full runtime in either order, with one warning that another options participant did not enable `composedRuntime`. Early participants applied through wrappers are retained, so late opt-in still observes the earlier opt-out.

If any participant requests composition across incompatible compiler protocols, the named slot diagnostic rejects the build in either order. This includes old/current mixed-mode requests: an older planner cannot be safely adapted by the newer copy. Opting every participant out preserves the supported full-runtime path; enabling composition requires all copies to use the current protocol.

The harness asserts old/old and baseline/current all-legacy controls, current mixed-mode fallback controls, and incompatible-protocol requests with both true/true and mixed true/false settings. It reproduces the reported legacy regression in actual installed package roots rather than only emulating a participant shape.

The early-needs fixtures use an actual installed `ContainerReferencePlugin` from copy A followed by an opaque wrapper applying copy B's `ModuleFederationPlugin` with `composedRuntime: true` and no remotes option. Forward, reverse, and `afterPlugins` wrapper orders all produce `errors=[]`, `warnings=[]`, `selectedAdapters=["remotes","share-scope"]`, and exactly one `adapters/remotes.js` graph module. Their dynamic HTTP remote imports are compiled but not executed. The independent compatible/full-runtime controls execute their emitted bundles for instance identity.
