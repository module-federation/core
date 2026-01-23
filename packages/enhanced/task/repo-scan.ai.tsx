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

export const repoScanReport = assetRef('repo_scan_report');

export default (
  <Program
    id="repo-scan"
    target={{ language: 'markdown' }}
    description="Capture a baseline inventory of the current enhanced test setup (targets, configs, and Jest/Vitest artifacts) to guide the Rstest migration."
  >
    <Asset
      id="repo_scan_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/repo-scan.md"
    />

    <Agent id="write-repo-scan-report" produces={['repo_scan_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are gathering a concise baseline inventory for a test runner
          migration. You do not change any files in this step.
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
          {ctx.file('packages/enhanced/rstest.config.ts', {
            as: 'packages/enhanced/rstest.config.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/vitest.config.ts', {
            as: 'packages/enhanced/vitest.config.ts',
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
          {ctx.file('packages/enhanced/tsconfig.spec.json', {
            as: 'packages/enhanced/tsconfig.spec.json',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/setupTestFramework.js', {
            as: 'packages/enhanced/test/setupTestFramework.js',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Write a short baseline report to `{{assets.repo_scan_report.path}}`:
          - Current test targets and which runner each uses.
          - Current Rstest include/exclude coverage and setup hooks.
          - Jest/Vitest-only configs or scripts that must be retired.
          - Any immediate migration blockers or risks.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
