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
import './rstest-config.ai.tsx';
import './jest-api-migration.ai.tsx';

export const configCasesReport = assetRef('config_cases_report');

export default (
  <Program
    id="config-cases"
    target={{ language: 'markdown' }}
    description="Ensure config-case runners (ConfigTestCases.*) execute under Rstest without duplicates and without output collisions."
  >
    <Asset
      id="config_cases_report"
      kind="doc"
      path="../generated/enhanced-rstest-migration/config-cases.md"
    />

    <Agent id="audit-config-cases">
      <Prompt>
        <System>
          You are migrating a test suite from Jest/Vitest to Rstest. You make
          minimal, high-signal changes and avoid duplicate test execution.
        </System>
        <Context>
          {ctx.file('task/request.md', { as: 'Task request', mode: 'quote' })}
          {ctx.file('rstest.config.ts', { as: 'rstest.config.ts', mode: 'code' })}
          {ctx.file('vitest.config.ts', { as: 'vitest.config.ts', mode: 'code' })}
          {ctx.file('test/ConfigTestCases.rstest.ts', {
            as: 'test/ConfigTestCases.rstest.ts',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.basictest.rstest.ts', {
            as: 'test/ConfigTestCases.basictest.rstest.ts',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.embedruntime.rstest.ts', {
            as: 'test/ConfigTestCases.embedruntime.rstest.ts',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.basictest.vitest.ts', {
            as: 'test/ConfigTestCases.basictest.vitest.ts',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.embedruntime.vitest.ts', {
            as: 'test/ConfigTestCases.embedruntime.vitest.ts',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.basictest.js', {
            as: 'test/ConfigTestCases.basictest.js',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.embedruntime.js', {
            as: 'test/ConfigTestCases.embedruntime.js',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.template.js', {
            as: 'test/ConfigTestCases.template.js',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Audit the ConfigTestCases runners and identify any of the following
          risks:
          1) Duplicate execution under Rstest (e.g., overlapping include globs
             running multiple entrypoints, or accidentally treating a shared
             harness as a test file).
          2) Output/cache directory collisions between basictest and embedruntime
             runs (they should not write into the same test/js subpaths).
          3) Legacy Jest/Vitest entrypoints that could still be picked up by
             Rstest include patterns.

          Do not edit files yet. Produce a short, actionable checklist that the
          next agent can apply directly as code changes.
        </Instructions>
      </Prompt>
    </Agent>

    <Agent id="apply-config-case-fixes" needs={['audit-config-cases']}>
      <Prompt>
        <System>
          You are performing a careful test-runner migration. You prefer the
          smallest change that prevents duplicates and makes suite behavior
          deterministic.
        </System>
        <Context>
          {ctx.file('rstest.config.ts', { as: 'rstest.config.ts', mode: 'code' })}
          {ctx.file('test/ConfigTestCases.rstest.ts', {
            as: 'test/ConfigTestCases.rstest.ts',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.basictest.rstest.ts', {
            as: 'test/ConfigTestCases.basictest.rstest.ts',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.embedruntime.rstest.ts', {
            as: 'test/ConfigTestCases.embedruntime.rstest.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Apply the minimal code/config changes needed so ConfigTestCases run
          under Rstest without duplicates and without output collisions:

          - Ensure basictest and embedruntime runs use distinct suite identifiers
            (config.name) so their output/cache directories under test/js do not
            collide.
          - Ensure any shared harness file is not accidentally executed as a test
            file when Rstest include patterns are broadened (either by excluding
            it in rstest.config.ts or by renaming/restructuring in a minimal,
            low-risk way).
          - Do not delete legacy Jest/Vitest files in this module unless they
            are directly causing duplicate Rstest runs; prefer fixing include/
            exclude to keep blast radius small. If you must delete/rename, do it
            in a way that prevents accidental pickup by Rstest.

          After edits, re-check for:
          - Only the intended runner entrypoints define tests under Rstest.
          - No two entrypoints write into the same test/js subpath.
        </Instructions>
      </Prompt>
    </Agent>

    <Agent
      id="write-config-cases-report"
      needs={['apply-config-case-fixes']}
      produces={['config_cases_report']}
    >
      <Prompt>
        <System>
          You write concise engineering notes focused on what changed and how to
          validate it.
        </System>
        <Context>
          {ctx.file('rstest.config.ts', { as: 'rstest.config.ts', mode: 'code' })}
          {ctx.file('test/ConfigTestCases.basictest.rstest.ts', {
            as: 'test/ConfigTestCases.basictest.rstest.ts',
            mode: 'code',
          })}
          {ctx.file('test/ConfigTestCases.embedruntime.rstest.ts', {
            as: 'test/ConfigTestCases.embedruntime.rstest.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Write a short report to `{{assets.config_cases_report.path}}` with:
          - What was changed (files + intent)
          - How duplicates/output-collisions were prevented
          - How to verify locally (commands + what to look for)
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);

