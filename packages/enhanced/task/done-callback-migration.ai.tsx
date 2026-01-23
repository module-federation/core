import {
  Program,
  Action,
  Agent,
  Asset,
  Prompt,
  Skill,
  System,
  Instructions,
  Context,
  ctx,
  assetRef,
  action,
} from '@unpack/ai';

import './repo-scan.ai.tsx';

export const doneCallbackReport = assetRef('done_callback_report');

export const scanDoneCallbacks = action(async (actx) => {
  const run = async (cmd: string) => {
    const res = await actx.shell.exec(cmd);
    return {
      stdout: res.stdout ?? '',
      stderr: res.stderr ?? '',
      exitCode: res.exitCode ?? 0,
    };
  };

  const rgCmd =
    "rg -n --hidden --glob '!.git' --glob '!node_modules' --glob '!dist' --glob '!coverage' \"\\(done\\b\" packages/enhanced/test";
  const rgRes = await run(rgCmd);

  const grepRes =
    rgRes.exitCode === 127
      ? await run(
          "grep -RIn --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage \"(done\" packages/enhanced/test || true",
        )
      : rgRes.exitCode === 0
        ? rgRes
        : rgRes.exitCode === 1
          ? rgRes
          : rgRes;

  const lines = (grepRes.stdout || '').split('\n').filter(Boolean);
  const limited = lines.slice(0, 200);

  return {
    tool: rgRes.exitCode === 127 ? 'grep' : 'rg',
    query: '(done',
    totalMatchesApprox: lines.length,
    firstMatches: limited,
    note:
      lines.length > limited.length
        ? `Output truncated to ${limited.length} lines. Re-run locally for full results.`
        : undefined,
  };
});

export default (
  <Program
    id="done-callback-migration"
    target={{ language: 'markdown' }}
    description="Remove callback-style done usage across tests/helpers and convert to async/Promise patterns compatible with Rstest."
  >
    <Asset
      id="done_callback_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/done-callback-migration.md"
    />

    <Action id="scan-done-callbacks" export="scanDoneCallbacks" cache />

    <Agent id="apply-done-callback-migration" produces={['done_callback_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are migrating tests to Rstest. Remove done callbacks by converting
          tests/hooks to async or Promise-based flows while preserving behavior.
        </System>
        <Skill name="rstest-docs" />
        <Context>
          {ctx.file('packages/enhanced/task/request.md', {
            as: 'Task request',
            mode: 'quote',
          })}
          {ctx.actionResult('scan-done-callbacks', {
            as: 'Repo scan: done callback candidates',
          })}
          {ctx.file('packages/enhanced/test/helpers/expectWarningFactory.js', {
            as: 'packages/enhanced/test/helpers/expectWarningFactory.js',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/warmup-webpack.js', {
            as: 'packages/enhanced/test/warmup-webpack.js',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/setupTestFramework.js', {
            as: 'packages/enhanced/test/setupTestFramework.js',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/helpers/createLazyTestEnv.js', {
            as: 'packages/enhanced/test/helpers/createLazyTestEnv.js',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/compiler-unit/container/HoistContainerReferencesPlugin.test.ts', {
            as: 'packages/enhanced/test/compiler-unit/container/HoistContainerReferencesPlugin.test.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Apply the edits below to the real files, then write the report.

          Update the provided files to remove any done callbacks:
          - Convert hooks/tests that accept `done` into async functions or
            functions that return a Promise.
          - Preserve timeout and error behavior (e.g., warmup-webpack timeout).
          - If a helper branches on `fn.length`, replace done-branch with a
            Promise wrapper.

          Use the scan output to check for any remaining done usage. If the
          scan lists files you did not update here, call them out in the report
          for follow-up.

          After edits, write a short report to
          `{{assets.done_callback_report.path}}` with:
          - What changed (files + intent).
          - How done callbacks were replaced (Promise/async patterns).
          - Remaining files with done usage (if any).
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
