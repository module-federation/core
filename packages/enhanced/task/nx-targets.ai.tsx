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

export const nxTargetsReport = assetRef('nx_targets_report');

export default (
  <Program
    id="nx-targets"
    target={{ language: 'markdown' }}
    description="Update packages/enhanced Nx targets so enhanced:test and related targets run Rstest instead of Jest/Vitest."
  >
    <Asset
      id="nx_targets_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/nx-targets.md"
    />

    <Agent id="apply-nx-targets" produces={['nx_targets_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are migrating Nx targets for packages/enhanced. You update targets
          to use Rstest while keeping existing command structure and safety
          flags. Make the smallest changes needed.
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
          {ctx.file('package.json', { as: 'package.json', mode: 'code' })}
        </Context>
        <Instructions>
          Apply the edits below to the real files, then write the report.

          Edit the real files to switch enhanced test targets to Rstest:
          - In `packages/enhanced/project.json`, change the `test` target to run
            Rstest with `packages/enhanced/rstest.config.ts` (keep node options
            like `--experimental-vm-modules`).
          - Remove or replace `test:jest` and `test:experiments` with Rstest
            equivalents, or delete them if they are no longer needed.
          - Update `pre-release` to reference the new Rstest-based targets
            (remove references to Jest-specific targets).
          - In the root `package.json`, ensure `enhanced:rstest` uses the same
            Rstest command and does not have trailing spaces.

          After editing, write a short report to
          `{{assets.nx_targets_report.path}}` with:
          - What changed in targets/scripts.
          - The new command(s) to run tests.
          - Any follow-up needed (if you could not remove a target).
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
