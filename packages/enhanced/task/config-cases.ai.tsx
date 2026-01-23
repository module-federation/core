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
import './rstest-config.ai.tsx';
import './jest-api-migration.ai.tsx';

export const configCasesReport = assetRef('config_cases_report');

export default (
  <Program
    id="config-cases"
    target={{ language: 'markdown' }}
    description="Ensure ConfigTestCases runners execute under Rstest without duplicates and without output collisions."
  >
    <Asset
      id="config_cases_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/config-cases.md"
    />

    <Agent id="apply-config-cases" produces={['config_cases_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are migrating ConfigTestCases to Rstest. Make minimal changes to
          prevent duplicate execution and output collisions.
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

          Update the ConfigTestCases Rstest entrypoints to avoid duplicates and
          output collisions:
          - Ensure basictest and embedruntime suites use distinct `config.name`
            (or equivalent identifiers) so `test/js` output paths do not
            collide.
          - Make sure shared harness code is not accidentally included as a
            test file when Rstest globs are broadened.
          - If you must adjust `rstest.config.ts` to prevent accidental
            inclusion, keep the change minimal and aligned with the config
            module.

          After edits, write a short report to
          `{{assets.config_cases_report.path}}` with:
          - What changed (files + intent).
          - How duplicates/output collisions were prevented.
          - How to verify (commands + what to look for).
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
