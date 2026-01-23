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

export const tsconfigSpecReport = assetRef('tsconfig_spec_report');

export default (
  <Program
    id="tsconfig-spec"
    target={{ language: 'markdown' }}
    description="Update packages/enhanced/tsconfig.spec.json to use Rstest globals/types and remove Jest types."
  >
    <Asset
      id="tsconfig_spec_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/tsconfig-spec.md"
    />

    <Agent id="apply-tsconfig-spec" produces={['tsconfig_spec_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are updating TypeScript test config for a Rstest migration. Keep
          the config minimal and aligned with the new runner.
        </System>
        <Skill name="rstest-docs" />
        <Context>
          {ctx.file('packages/enhanced/task/request.md', {
            as: 'Task request',
            mode: 'quote',
          })}
          {ctx.file('packages/enhanced/tsconfig.spec.json', {
            as: 'packages/enhanced/tsconfig.spec.json',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/rstest.config.ts', {
            as: 'packages/enhanced/rstest.config.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Apply the edits below to the real files, then write the report.

          Update `packages/enhanced/tsconfig.spec.json`:
          - Replace `jest` types with `@rstest/core/globals` (keep `node`).
          - Ensure the include patterns cover `test/**/*.test.ts`,
            `test/**/*.spec.ts`, and `test/**/*.rstest.ts`.
          - Remove Jest-specific files from includes if they are no longer
            needed (e.g., `jest.config.ts`).

          After edits, write a short report to
          `{{assets.tsconfig_spec_report.path}}` with:
          - What changed in types/includes.
          - Any follow-up for globals/imports.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
