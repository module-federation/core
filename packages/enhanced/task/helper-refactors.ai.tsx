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
import './jest-api-migration.ai.tsx';

export const helperRefactorsReport = assetRef('helper_refactors_report');

export default (
  <Program
    id="helper-refactors"
    target={{ language: 'markdown' }}
    description="Refactor Jest-dependent helpers to be Rstest-native or remove them when unused."
  >
    <Asset
      id="helper_refactors_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/helper-refactors.md"
    />

    <Agent id="apply-helper-refactors" produces={['helper_refactors_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are refactoring shared test helpers for a runner migration. Make
          minimal changes that remove Jest-only dependencies while preserving
          helper behavior.
        </System>
        <Skill name="rstest-docs" />
        <Context>
          {ctx.file('packages/enhanced/task/request.md', {
            as: 'Task request',
            mode: 'quote',
          })}
          {ctx.file('packages/enhanced/rstestmigrate.md', {
            as: 'Local migration notes',
            mode: 'quote',
          })}
          {ctx.file('packages/enhanced/rstest.config.ts', {
            as: 'packages/enhanced/rstest.config.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/tsconfig.spec.json', {
            as: 'packages/enhanced/tsconfig.spec.json',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/helpers/webpackMocks.ts', {
            as: 'packages/enhanced/test/helpers/webpackMocks.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/helpers/createLazyTestEnv.js', {
            as: 'packages/enhanced/test/helpers/createLazyTestEnv.js',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/compiler-unit/utils.ts', {
            as: 'packages/enhanced/test/compiler-unit/utils.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/unit/container/utils.ts', {
            as: 'packages/enhanced/test/unit/container/utils.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Apply the edits below to the real files, then write the report.

          Refactor the helper files to remove Jest-only dependencies:
          - Replace `jest.fn`/`jest.spyOn` usage with `rs.fn`/`rs.spyOn` and add
            `import { rs } from '@rstest/core'` where needed.
          - Replace `jest.Mock`/`jest.Mocked*` types with Rstest equivalents or
            rely on inference.
          - If `createLazyTestEnv.js` relies on Jest-only globals, refactor it
            to be runner-agnostic.
          - Remove helpers only if there are no remaining imports.

          After edits, write a short report to
          `{{assets.helper_refactors_report.path}}` with:
          - What changed (files + intent).
          - Any behavior differences and how they were handled.
          - How to verify locally.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
