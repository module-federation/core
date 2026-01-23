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
  action,
  assetRef,
} from '@unpack/ai';

import './nx-targets.ai.tsx';
import './rstest-config.ai.tsx';
import './tsconfig-spec.ai.tsx';
import './jest-api-migration.ai.tsx';
import './done-callback-migration.ai.tsx';
import './helper-refactors.ai.tsx';
import './config-cases.ai.tsx';
import './remove-jest-infra.ai.tsx';

export const validationReport = assetRef('validation_report');

export const runValidation = action(async (ctx) => {
  const commands = [
    'pnpm -C packages/enhanced rstest list --filesOnly -c packages/enhanced/rstest.config.ts',
    'pnpm enhanced:rstest',
  ];

  const results: Array<{
    command: string;
    stdout: string;
    stderr: string;
    exitCode: number;
  }> = [];

  for (const command of commands) {
    const { stdout, stderr, exitCode } = await ctx.shell.exec(command, {
      cwd: ctx.program.workingDir,
    });
    results.push({ command, stdout, stderr, exitCode });
  }

  return { commands, results };
});

export default (
  <Program
    id="validate"
    target={{ language: 'markdown' }}
    description="Run Rstest listing and execution commands (rstest list/run) plus any necessary typecheck/build checks; record failures and produce a validation report for the orchestrator."
  >
    <Asset
      id="validation_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/validation.md"
    />

    <Action id="run-validation" export="runValidation" />

    <Agent id="write-validation-report" produces={['validation_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You write concise validation reports for test-suite migrations. You
          include the exact commands and the observed outcomes.
        </System>
        <Skill name="rstest-docs" />
        <Context>
          {ctx.actionResult('run-validation', { as: 'Validation results' })}
        </Context>
        <Instructions>
          Write a validation report to `{{assets.validation_report.path}}` with:
          - The commands that were run
          - Whether each one succeeded (exit code)
          - Any actionable failures (first error snippet + likely next step)
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
