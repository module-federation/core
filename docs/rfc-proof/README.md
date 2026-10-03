# Runtime RFC behavioral proof ledger

Status at investigation start: no stack is approved by this ledger. Green CI alone does not establish the behaviors below. RFC5036 and RFC5128 are alternative implementations and remain separate branches. Tests will record literal expected outcomes, exact source heads, commands, and terminal results. Unrun cells remain unrun.

## Source heads

| PR | Source head | Base branch |
| --- | --- | --- |
| #5093 | `00b53e38730a4728781282b036847ab9194bfe3a` | `main` |
| #5094 | `d077ea1969d78fb98d1d4fbbd67427a52ea0deac` | `rfc5036/01-runtime-family-resolver` |
| #5095 | `9fb0f2fc76a21059688ae7d8c2d867a13ee7994c` | `rfc5036/02-compiler-coordination` |
| #5096 | `f32aae69b62b66f7f7453ce3ad038b13b8d1d3f3` | `rfc5036/03-runtime-selectors` |
| #5097 | `9f7dc2319d336e9615c12f1187e4f67aae83ea71` | `rfc5036/04-runtime-image-cache` |
| #5098 | `17531d70586dee766d9b67f18b8efb7fdffef848` | `rfc5036/05-esbuild-rollout` |
| #5107 | `c813c4fdd82e3f146daca65c322b481ada0cb6c9` | `rfc5036/06-docs-rollout` |
| #5135 | `b5733f4712ee2e696af9d5b68b4b5e0e0112b59f` | `main` |
| #5137 | `ab1bcc0401f1eb93729004a069586f0d6510e4df` | `rfc5128/01-runtime-core-kernel` |
| #5139 | `302500c868c4f5fb862356e0f3509089897bc066` | `rfc5128/02-bundler-runtime-compose` |
| #5134 | `a3a65b4be74b7e4bfd41adc8da6124ea82df384c` | `rfc5128/03-node-esbuild-runtime` |
| #5140 | `f2eb03ceefc96adde04bb266107fb0284cd17e8a` | `rfc5128/04-managers-composition` |
| #5141 | `84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec` | `rfc5128/05-enhanced-composed` |
| #5142 | `db5159fcffec872651ed9b11d2ad2ca1f4c0fcb2` | `rfc5128/06-rspack-composed` |

## Behavioral matrix

| Behavior | Literal expected outcome | State | Owner / links |
| --- | --- | --- | --- |
| Compiler slot schema/version | Unsupported version or malformed participants rejects with diagnostic; compatible shared slot is reused | FAIL: live RFC5036 returned version 2; correction running | #5093 |
| Two installed plugin copies | Compatible family/target works both orders; conflicting family or target rejects both orders | RUNNING | #5093, #5140 |
| Shared enabled, remote disabled | Shared fallback executes real entry through selected platform; remote consumption and snapshot implementations stay absent | RUNNING | #5134, #5140, #5141, #5142 |
| Evaluated entry cache | Incompatible evaluator identities never share a result; concurrent compatible loads dedupe; rejected load retries; reset clears state | RUNNING | #5096, #5135 |
| Rule-level aliases | Final modules preserve one selected family and one runtime instance, or a named incompatibility rejects | RUNNING | #5094, #5134, #5140, #5141 |
| Child compilers | Real createChildCompiler inherits intended selection, nested options are isolated, parent remains unchanged | RUNNING | #5094, #5140, #5141 |
| Ordinary externals | Object, regex, function, byLayer, issuer/subpath selectors keep compatible minor fallback and strict major diagnostics | RUNNING | #5094, #5140, #5141, #5142 |
| Require-only capability exports | Minor release falls back when an ESM composition leaf is unavailable; malformed contracts report errors; major rejects explicitly | RUNNING | #5134, #5140, #5141, #5142 |
| Packed stable entries | Root, helpers, core resolve through installed packed artifacts; mixed supported plugin/runtime versions execute | RUNNING | #5095, #5135, #5137 |
| Vite/Rolldown and external runtime | Supported integration owns package conditions and private imports correctly; external provider preserves evaluator identity | PLANNED; unsupported/local-unavailable cases will be UNRUN | #5097, #5139 |

First reproduced failure: at `c813c4fdd82e3f146daca65c322b481ada0cb6c9`, bundling actual `compilerSlot.ts` and seeding `{ version: 2 }` under `Symbol.for('module-federation.runtime-selection.v1')` returns that unsupported slot. The fail-closed executable exits 1. Exact checked-in fixture and rerun command will accompany the correction.

No merge, release, deployment, force push, or credential/settings change is authorized or performed by this investigation. Changed links will be tested and resulting CI recorded before handoff.
