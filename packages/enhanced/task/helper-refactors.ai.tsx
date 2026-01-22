import {
  Program,
  Agent,
  Asset,
  Prompt,
  System,
  Instructions,
  Context,
  ctx,
  assetRef,
} from '@unpack/ai';

import './repo-scan.ai.tsx';
import './jest-api-migration.ai.tsx';

export const helperRefactorsReport = assetRef('helper_refactors_report');

export default (
  <Program
    id="helper-refactors"
    target={{ language: 'markdown' }}
    description="Refactor Jest-dependent helpers (e.g., test/helpers/webpackMocks.ts, createLazyTestEnv.js) to be Rstest-native or remove them when unused."
  >
    <Asset id="file2" kind="code" path="task/helper-refactors.ai.tsx" />
    <Asset
      id="helper_refactors_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/helper-refactors.md"
    />

    <Agent id="audit-jest-dependent-helpers">
      <Prompt>
        <System>
          You are migrating a test suite from Jest/Vitest to Rstest. You focus
          on shared helper utilities used by many tests, and you keep changes
          minimal while making behavior deterministic under Rstest.
        </System>
        <Context>
          {ctx.file('task/request.md', { as: 'Task request', mode: 'quote' })}
          {ctx.file('rstestmigrate.md', { as: 'Local migration notes', mode: 'quote' })}
          {ctx.file('rstest.config.ts', { as: 'rstest.config.ts', mode: 'code' })}
          {ctx.file('tsconfig.spec.json', {
            as: 'tsconfig.spec.json',
            mode: 'code',
          })}
          {ctx.file('test/helpers/webpackMocks.ts', {
            as: 'test/helpers/webpackMocks.ts',
            mode: 'code',
          })}
          {ctx.file('test/helpers/createLazyTestEnv.js', {
            as: 'test/helpers/createLazyTestEnv.js',
            mode: 'code',
          })}
          {ctx.file('test/compiler-unit/utils.ts', {
            as: 'test/compiler-unit/utils.ts',
            mode: 'code',
          })}
          {ctx.file('test/unit/container/utils.ts', {
            as: 'test/unit/container/utils.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Audit the shared test helpers for Jest-only dependencies and identify
          what must change so the helpers work under Rstest:

          - Replace usages of global `jest.*` APIs (fn, spyOn, mockReturnValue,
            etc.) with Rstest equivalents (from `@rstest/core`) or with small
            local stubs when a direct equivalent is not needed.
          - Ensure TypeScript types in helpers do not reference `jest.*` types.
          - Confirm that `createLazyTestEnv.js` does not rely on Jest runtime
            behavior (e.g., module registry resets); if it does, propose the
            smallest change to make it runner-agnostic.
          - Identify any helper that is now unused after the API migration and
            could be removed safely (only if there are no imports/uses).

          Output:
          - A short checklist of exact edits per file (what to change and what
            to replace it with).
          - Any risks (e.g., behavior differences between Jest mocks and Rstest
            mocks) and how to mitigate them with minimal code.

          Do not edit files yet in this step.
        </Instructions>
      </Prompt>
    </Agent>

    <Agent
      id="refactor-helpers-for-rstest"
      needs={['audit-jest-dependent-helpers']}
    >
      <Prompt>
        <System>
          You are applying helper refactors required for a runner migration. You
          make the smallest set of changes that removes Jest-only dependencies
          while preserving helper semantics for downstream tests.
        </System>
        <Context>
          {ctx.file('rstest.config.ts', { as: 'rstest.config.ts', mode: 'code' })}
          {ctx.file('test/helpers/webpackMocks.ts', {
            as: 'test/helpers/webpackMocks.ts',
            mode: 'code',
          })}
          {ctx.file('test/helpers/createLazyTestEnv.js', {
            as: 'test/helpers/createLazyTestEnv.js',
            mode: 'code',
          })}
          {ctx.file('test/compiler-unit/utils.ts', {
            as: 'test/compiler-unit/utils.ts',
            mode: 'code',
          })}
          {ctx.file('test/unit/container/utils.ts', {
            as: 'test/unit/container/utils.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Edit the real source files to refactor Jest-dependent helpers so they
          run under Rstest.

          Requirements:
          - Replace any `jest.fn()` usage in helpers with `rs.fn()` and any
            `jest.spyOn` with `rs.spyOn`, importing `rs` from `@rstest/core` in
            TypeScript files that need it.
          - Replace `jest.Mock`, `jest.MockedFunction`, and `jest.Mocked<T>`
            helper return types with Rstest-friendly types (prefer inference;
            otherwise use types from `@rstest/core` if available in this repo).
          - Avoid rewriting helper behavior beyond what is needed to remove Jest
            dependencies. Prefer localized substitutions.
          - If a helper file becomes unused, you may remove it, but only after
            confirming there are no remaining imports/usages in the repo.

          Guardrails:
          - Do not change the behavior or shape of the helper exports unless a
            downstream test requires it (update all call sites if you must).
          - If `createLazyTestEnv.js` has any coupling to Jest module resets or
            isolation, rework it to be explicit and runner-agnostic (no global
            `jest` access).
        </Instructions>
      </Prompt>
    </Agent>

    <Agent
      id="write-helper-refactors-report"
      needs={['refactor-helpers-for-rstest']}
      produces={['helper_refactors_report']}
    >
      <Prompt>
        <System>
          You write concise engineering notes focused on what changed and how to
          validate it.
        </System>
        <Context>
          {ctx.file('test/helpers/webpackMocks.ts', {
            as: 'test/helpers/webpackMocks.ts',
            mode: 'code',
          })}
          {ctx.file('test/helpers/createLazyTestEnv.js', {
            as: 'test/helpers/createLazyTestEnv.js',
            mode: 'code',
          })}
          {ctx.file('test/compiler-unit/utils.ts', {
            as: 'test/compiler-unit/utils.ts',
            mode: 'code',
          })}
          {ctx.file('test/unit/container/utils.ts', {
            as: 'test/unit/container/utils.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Write a short report to `{{assets.helper_refactors_report.path}}` with:
          - What was changed (files + intent)
          - Any behavior differences from Jest mocks (if any) and how they were
            handled
          - How to verify locally (commands + what to look for)
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
