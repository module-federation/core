import {
  Program,
  Agent,
  Asset,
  Prompt,
  Skill,
  System,
  Instructions,
  Context,
  ctx,
  assetRef,
} from '@unpack/ai';

import './repo-scan.ai.tsx';

export const rstestConfigReport = assetRef('rstest_config_report');

export default (
  <Program
    id="rstest-config"
    target={{ language: 'markdown' }}
    description="Expand packages/enhanced/rstest.config.ts coverage and set up Rstest for unit + config-case suites."
  >
    <Asset
      id="rstest_config_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/rstest-config.md"
    />

    <Agent id="apply-rstest-config" produces={['rstest_config_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are updating Rstest configuration for packages/enhanced. Make the
          smallest changes that broaden coverage without introducing duplicate
          runs.
        </System>
        <Skill name="rstest-docs" />
        <Context>
          {ctx.file('packages/enhanced/task/request.md', {
            as: 'Task request',
            mode: 'quote',
          })}
          {ctx.file('packages/enhanced/rstest.config.ts', {
            as: 'packages/enhanced/rstest.config.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/setupTestFramework.js', {
            as: 'packages/enhanced/test/setupTestFramework.js',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/ConfigTestCases.rstest.ts', {
            as: 'packages/enhanced/test/ConfigTestCases.rstest.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/ConfigTestCases.basictest.rstest.ts', {
            as: 'packages/enhanced/test/ConfigTestCases.basictest.rstest.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/ConfigTestCases.embedruntime.rstest.ts', {
            as: 'packages/enhanced/test/ConfigTestCases.embedruntime.rstest.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Apply the edits below to the real files, then write the report.

          Update `packages/enhanced/rstest.config.ts` so Rstest covers the full
          test suite without duplicate runs:
          - Include unit and compiler tests (`test/**/*.test.ts`,
            `test/**/*.spec.ts`, `test/**/*.rstest.ts`) in addition to the
            ConfigTestCases runners.
          - Exclude non-Rstest variants (`**/*.vitest.ts`,
            `**/*.basictest.js`, `**/*.embedruntime.js`).
          - Add `setupFiles` to apply `test/setupTestFramework.js`.
          - If config-case suites are significantly slower, use Rstest
            `projects` to separate them and give them a larger `testTimeout`.

          Keep the config concise and use `path.resolve(__dirname, ...)` for
          paths.

          After edits, write a short report to
          `{{assets.rstest_config_report.path}}` with:
          - The new include/exclude behavior.
          - Any project split you introduced and the timeout(s).
          - How to verify with `rstest list`.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
