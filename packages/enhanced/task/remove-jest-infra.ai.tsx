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

import './nx-targets.ai.tsx';
import './jest-api-migration.ai.tsx';
import './config-cases.ai.tsx';

export const removeJestInfraReport = assetRef('remove_jest_infra_report');

export default (
  <Program
    id="remove-jest-infra"
    target={{ language: 'markdown' }}
    description="Remove or deprecate Jest-only configs and scripts in packages/enhanced once Rstest is in place."
  >
    <Asset
      id="remove_jest_infra_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/remove-jest-infra.md"
    />

    <Agent id="apply-remove-jest-infra" produces={['remove_jest_infra_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are removing Jest-only infrastructure after a test runner
          migration. Only remove what is truly unused by Rstest/Vitest.
        </System>
        <Skill name="rstest-docs" />
        <Context>
          {ctx.file('packages/enhanced/task/request.md', {
            as: 'Task request',
            mode: 'quote',
          })}
          {ctx.file('packages/enhanced/project.json', {
            as: 'packages/enhanced/project.json',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/jest.config.ts', {
            as: 'packages/enhanced/jest.config.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/jest.embed.ts', {
            as: 'packages/enhanced/jest.embed.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/patch-node-env.js', {
            as: 'packages/enhanced/test/patch-node-env.js',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/helpers/createLazyTestEnv.js', {
            as: 'packages/enhanced/test/helpers/createLazyTestEnv.js',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Apply the edits below to the real files, then write the report.

          Remove or deprecate Jest-only infrastructure:
          - Delete `packages/enhanced/jest.config.ts` and
            `packages/enhanced/jest.embed.ts` if no longer referenced by targets
            or scripts. If you keep them, add a comment explaining why.
          - Remove `test/patch-node-env.js` if it is only used by Jest.
          - If `createLazyTestEnv.js` depends on Jest-only globals, refactor it
            to be runner-agnostic or document why it must stay.

          Update `packages/enhanced/project.json` to drop any remaining Jest
          references in targets.

          After edits, write a report to
          `{{assets.remove_jest_infra_report.path}}` with:
          - What was removed or refactored.
          - Any remaining Jest-only artifacts and why they are still required.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
