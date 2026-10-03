# RFC5036 real Rspack loader compatibility in Jest tests

Exact pushed-tip CI failure evidence is retained in `RFC5036_CI_5107_FAILURE.log`: webpack-bundler-runtime container-entry-selector and SDK platform-loader-selector call Jest29's intercepted `createRequire` against installed Rspack2.1.10, producing “Cannot use import statement outside a module”/“Must use import to load ES Module”. The Rspack plugin test's runtime import takes the same incompatible route. Turbo fails fast; secondary Rstest SIGINT is not counted as a separate assertion defect.

Two focused commits in original `rfc5036` proof worktree:

- `8d8a7f08dd88494ecfc1c798f091a05586a61b87`: shared `tools/testing/loadNativeRspack.ts` uses `process.getBuiltinModule('node:module').createRequire`, anchored at the installed rspack package manifest. The Rspack test changes its runtime import to the helper; Compiler remains a type-only import. No test assertions change. Integration audit established that #5093 is mock-only and has no runtime @rspack/core import; the real compiler test starts at #5094. Root preserved #5093 unchanged and applied this helper/import correction at #5094 and descendants. The earlier attribution to #5093 was incorrect.
- `6ba9f8a0e3da313d94079018e0d7407f6b0dd20f`: SDK and bundler-runtime compiler-selector tests load `loadNativeRspack().rspack`; webpack loading remains unchanged. These tests first appear at #5095, so this commit belongs there and descendants, after the helper commit.

The helper loads the actual installed compiler and typed API with Node24's native loader; it introduces no mock compiler, moduleNameMapper, new flags, CI configuration, package settings, production code, public contracts or weakened assertions. Existing CompilerFactory casts in the selector tests are retained, with no new casts in the helper. Test-only changes need no publishable-package changeset.

Original-worktree validation ran with `PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH` and corepack pnpm10.28.0, using the actual package scripts and no external adapter:

| Command                                                                      | Actual result                                                                 | Task-root log                 |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| `corepack pnpm --filter @module-federation/rspack run test`                  | exit0; 1 suite, 6 tests pass, 0 skips                                         | rfc5036-native-ci-rspack.log  |
| `corepack pnpm --filter @module-federation/sdk run test`                     | exit0; 11 suites, 80 tests pass, 1 existing skip; package's VM flag preserved | rfc5036-native-ci-sdk.log     |
| `corepack pnpm --filter @module-federation/webpack-bundler-runtime run test` | exit0; 10 suites, 108 tests pass, 0 skips                                     | rfc5036-native-ci-bundler.log |
| `corepack pnpm exec prettier --check .`                                      | exit0; full original repository formatted                                     | rfc5036-native-ci-format.log  |
| `git diff --check`; `git status --short`                                     | pass; clean after commits                                                     | tool history                  |

The original proof checkout installs Rspack1.3.9. Exact integrated checkout installs Rspack2.1.10, so these passes establish backward compatibility but do not alone close the exact CI boundary. Final integrated package-script results appear below at the exact parent-integrated tip. The earlier external native-loader adapter proved194 actual tests on2.1.10, but is not substituted for the checked-in correction's package-script validation.

No package build was repeated for this test-only import correction: package production sources and build/test configurations are unchanged, and existing builds provide actual compiler inputs. No app/E2E/release/deployment checks or remote writes were performed. Parent owns integration and safe CI/publication handling.

## Exact integrated Rspack2.1.10 closure

Final integrated head `8643b69633039571cac171d1595645b75e62cf95`, worktree `stack5107`, clean. Root applied the first compatibility correction at #5094 (`0fcb404ce`) and second at #5095 (`b447659fe`), then merge-propagated. #5093 remains unchanged: its test is mock-only, so the initial #5093 attribution was incorrect. Root aborted that attempted conflicting cherry-pick and corrected attribution before integration.

Actual installed version is2.1.10, recorded with the physical installed package path in `rfc5036-native-ci-final-version.log`. Commands ran from `stack5107` using Node24 PATH and corepack pnpm10.28.0:

| Command                                                                      | Actual result                                                 | Task-root evidence                  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- |
| `corepack pnpm --filter @module-federation/rspack run test`                  | exit0; 1 suite, 6 tests pass, 0 skips                         | rfc5036-native-ci-final-rspack.log  |
| `corepack pnpm --filter @module-federation/sdk run test`                     | exit0; 11 suites, 80 tests pass, 1 preexisting skip           | rfc5036-native-ci-final-sdk.log     |
| `corepack pnpm --filter @module-federation/webpack-bundler-runtime run test` | exit0; 10 suites, 108 tests pass, 0 skips                     | rfc5036-native-ci-final-bundler.log |
| `corepack pnpm exec prettier --check .`                                      | exit0; full repository formatting pass                        | rfc5036-native-ci-final-format.log  |
| `git diff --check`; `git status --short`; `git rev-parse HEAD`               | exit0; whitespace clean, worktree clean, exact head unchanged | tool history                        |

These are the repository's actual package scripts, with their existing flags/configs and checked-in helper. No temporary adapter, out-of-repository config, module mapper or replacement compiler is involved. Existing real compilation, capability, child inheritance, disabled-selector, worker-warning and bundle execution assertions all pass. The SDK skip is the unchanged `xit('should reuse an existing link element if one exists')` in `packages/sdk/__tests__/dom.spec.ts:370`.

`rfc5036-native-ci-final-source-fingerprints.json` records exact before/after heads, the four changed test/helper paths, and identical production/test-config/package-manifest Git tree hashes. Core163, runtime97, enhanced406+1skip, esbuild3, injector7, installed-copy40 and actual payload proofs were not rerun for this test-only change because their sources/configs are unchanged. Prior exact validations remain applicable with their documented scope. Earlier failed original Jest setup and full-format runs are retained as historical evidence; the exact current package-script and formatting gates above now pass. No claim is made that a new GitHub CI run occurred: further PR pushes are held by parent due automatic publication jobs. No remote or source changes were made during final integrated validation.
