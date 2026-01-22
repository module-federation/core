import { Program, Agent, Asset, Prompt, System, Instructions, Context, ctx } from '@unpack/ai';

import './repo-scan.ai.tsx';
import './nx-targets.ai.tsx';
import './rstest-config.ai.tsx';
import './tsconfig-spec.ai.tsx';
import './jest-api-migration.ai.tsx';
import './done-callback-migration.ai.tsx';
import './helper-refactors.ai.tsx';
import './config-cases.ai.tsx';
import './remove-jest-infra.ai.tsx';
import './validate.ai.tsx';

import { configCasesReport } from './config-cases.ai.tsx';
import { doneCallbackReport } from './done-callback-migration.ai.tsx';
import { helperRefactorsReport } from './helper-refactors.ai.tsx';
import { validationReport } from './validate.ai.tsx';

export default (
  <Program
    id="index"
    target={{ language: 'markdown' }}
    description="Entrypoint orchestrator that imports and sequences the migration phases, then runs validation commands and writes a final report."
  >
    <Asset id="file3" kind="code" path="task/index.ai.tsx" />
    <Asset
      id="final_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/report.md"
    />

    <Agent
      id="write-final-report"
      produces={['final_report']}
      external_needs={[
        { alias: 'configCasesReport', agent: 'write-config-cases-report' },
        { alias: 'doneCallbackReport', agent: 'write-done-callback-report' },
        { alias: 'helperRefactorsReport', agent: 'write-helper-refactors-report' },
        { alias: 'validationReport', agent: 'write-validation-report' },
      ]}
    >
      <Prompt>
        <System>
          You are coordinating a test-runner migration. You write short,
          actionable reports and you avoid speculation.
        </System>
        <Context>
          {ctx.file('task/request.md', { as: 'Task request', mode: 'quote' })}
          {configCasesReport}
          {doneCallbackReport}
          {helperRefactorsReport}
          {validationReport}
        </Context>
        <Instructions>
          {`Write a concise final report to \`{{assets.final_report.path}}\` with:`}

          - What changed across the migration (high level, grouped by phase)
          - Validation results (what commands were run and their outcome)
          - Known gaps/risks and how to verify them manually

          Keep it brief and focused on next actions.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
