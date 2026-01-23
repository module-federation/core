import {
  Program,
  Agent,
  Asset,
  Prompt,
  System,
  Instructions,
  Context,
  ctx,
} from '@unpack/ai';

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

import { repoScanReport } from './repo-scan.ai.tsx';
import { nxTargetsReport } from './nx-targets.ai.tsx';
import { rstestConfigReport } from './rstest-config.ai.tsx';
import { tsconfigSpecReport } from './tsconfig-spec.ai.tsx';
import { jestApiReport } from './jest-api-migration.ai.tsx';
import { doneCallbackReport } from './done-callback-migration.ai.tsx';
import { helperRefactorsReport } from './helper-refactors.ai.tsx';
import { configCasesReport } from './config-cases.ai.tsx';
import { removeJestInfraReport } from './remove-jest-infra.ai.tsx';
import { validationReport } from './validate.ai.tsx';

export default (
  <Program
    id="index"
    target={{ language: 'markdown' }}
    description="Entrypoint orchestrator that imports and sequences the migration phases, then runs validation commands and writes a final report."
  >
    <Asset
      id="final_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/report.md"
    />

    <Agent
      id="write-final-report"
      produces={['final_report']}
      external_needs={[
        { alias: 'repoScanReport', agent: 'write-repo-scan-report' },
        { alias: 'nxTargetsReport', agent: 'apply-nx-targets' },
        { alias: 'rstestConfigReport', agent: 'apply-rstest-config' },
        { alias: 'tsconfigSpecReport', agent: 'apply-tsconfig-spec' },
        { alias: 'jestApiReport', agent: 'apply-jest-api-migration' },
        { alias: 'doneCallbackReport', agent: 'apply-done-callback-migration' },
        { alias: 'helperRefactorsReport', agent: 'apply-helper-refactors' },
        { alias: 'configCasesReport', agent: 'apply-config-cases' },
        { alias: 'removeJestInfraReport', agent: 'apply-remove-jest-infra' },
        { alias: 'validationReport', agent: 'write-validation-report' },
      ]}
    >
      <Prompt skills={['rstest-docs']}>
        <System>
          You are coordinating a test-runner migration. You write short,
          actionable reports and you avoid speculation.
        </System>
        <Skill name="rstest-docs" />
        <Context>
          {ctx.file('packages/enhanced/task/request.md', {
            as: 'Task request',
            mode: 'quote',
          })}
          {repoScanReport}
          {nxTargetsReport}
          {rstestConfigReport}
          {tsconfigSpecReport}
          {jestApiReport}
          {doneCallbackReport}
          {helperRefactorsReport}
          {configCasesReport}
          {removeJestInfraReport}
          {validationReport}
        </Context>
        <Instructions>
          {`Write a concise final report to \`{{assets.final_report.path}}\` with:`}
          - What changed across the migration (grouped by phase). - Validation
          results (commands run and outcomes). - Known gaps/risks and how to
          verify them manually. Keep it brief and focused on next actions.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
