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

export const doneCallbackReport = assetRef('done_callback_report');

export default (
  <Program
    id="done-callback-migration"
    target={{ language: 'typescript' }}
    description="Remove callback-style done usage across tests/helpers and convert to async/Promise patterns compatible with Rstest."
  >
    <Asset id="file1" kind="code" path="task/done-callback-migration.ai.tsx" />
    <Asset
      id="done_callback_report"
      kind="doc"
      path="../generated/enhanced-rstest-migration/done-callback-migration.md"
    />

    <Agent id="audit-done-callback-usage">
      <Prompt>
        <System>
          You are migrating a test suite from Jest/Vitest to Rstest. Rstest does
          not support done callbacks in tests or hooks. You make minimal changes
          and preserve semantics.
        </System>
        <Context>
          {ctx.file('task/request.md', { as: 'Task request', mode: 'quote' })}
          {ctx.file('test/helpers/expectWarningFactory.js', {
            as: 'test/helpers/expectWarningFactory.js',
            mode: 'code',
          })}
          {ctx.file('test/warmup-webpack.js', {
            as: 'test/warmup-webpack.js',
            mode: 'code',
          })}
          {ctx.file('test/setupTestFramework.js', {
            as: 'test/setupTestFramework.js',
            mode: 'code',
          })}
          {ctx.file('test/helpers/createLazyTestEnv.js', {
            as: 'test/helpers/createLazyTestEnv.js',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.rstest.ts', {
            as: 'test/ConfigTestCases.rstest.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Identify callback-style done usage in the provided files and propose a
          minimal conversion plan to make them compatible with Rstest.

          Constraints:
          - Do not assume Jest-specific done support exists.
          - Prefer converting to async functions or returning Promises.
          - Keep timeouts and error reporting behavior intact.
          - Do not refactor unrelated Jest-state helpers (e.g.,
            createLazyTestEnv) unless required for removing done usage, and
            call out if another module should own that change.

          Output:
          - A concise checklist of exact edits per file (what to change + what
            the replacement should look like), focusing on:
            - beforeEach/afterEach done hooks
            - it(name, (done) => ...) tests
            - helper wrappers that branch on fn.length to decide done vs promise
        </Instructions>
      </Prompt>
    </Agent>

    <Agent id="convert-done-callbacks" needs={['audit-done-callback-usage']}>
      <Prompt>
        <System>
          You are applying a careful runner migration. You remove done callbacks
          by converting to Promise/async style while preserving failure
          semantics and timeouts.
        </System>
        <Context>
          {ctx.file('test/helpers/expectWarningFactory.js', {
            as: 'test/helpers/expectWarningFactory.js',
            mode: 'code',
          })}
          {ctx.file('test/warmup-webpack.js', {
            as: 'test/warmup-webpack.js',
            mode: 'code',
          })}
          {ctx.file('test/setupTestFramework.js', {
            as: 'test/setupTestFramework.js',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Edit the real source files to remove done usage in tests/hooks and to
          make wrapper utilities Rstest-compatible.

          Apply these concrete conversions:
          - Hook callbacks: replace beforeEach/afterEach signatures that take
            done with synchronous hooks (no done parameter) unless they truly
            need async behavior; in that case, return a Promise or mark async.
          - Tests: replace it(name, (done) => ...) with an async function (or
            return a Promise) and ensure failures reject/throw.
          - Debug wrappers (setupTestFramework.js): if the wrapper supports a
            "callback-style" test function, convert that branch to return a
            Promise (wrap the callback) instead of calling done. Ensure logs
            still print START/DONE OK/DONE FAIL consistently.

          Important:
          - Do not modify ConfigTestCases.* in this module unless done usage is
            directly executed by Rstest (most callback-style test functions in
            config-case bundles are wrapped and do not require Rstest done
            support).
          - Keep the existing timeout behavior (e.g., 300000 on warmup-webpack).
          - After edits, the touched files should not define any test/hook
            function that accepts a done callback.
        </Instructions>
      </Prompt>
    </Agent>

    <Agent
      id="write-done-callback-report"
      needs={['convert-done-callbacks']}
      produces={['done_callback_report']}
    >
      <Prompt>
        <System>
          You write concise engineering notes focused on what changed and how to
          verify it.
        </System>
        <Context>
          {ctx.file('test/helpers/expectWarningFactory.js', {
            as: 'test/helpers/expectWarningFactory.js',
            mode: 'code',
          })}
          {ctx.file('test/warmup-webpack.js', {
            as: 'test/warmup-webpack.js',
            mode: 'code',
          })}
          {ctx.file('test/setupTestFramework.js', {
            as: 'test/setupTestFramework.js',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Write a short report to `{{assets.done_callback_report.path}}` with:
          - What was changed (files + intent)
          - How done callbacks were replaced (Promise/async patterns)
          - How to verify locally (commands + what to look for)
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);

