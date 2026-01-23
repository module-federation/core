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
import './tsconfig-spec.ai.tsx';

export const jestApiReport = assetRef('jest_api_report');

export default (
  <Program
    id="jest-api-migration"
    target={{ language: 'markdown' }}
    description="Convert Jest APIs in packages/enhanced tests to Rstest equivalents and update imports/types as needed."
  >
    <Asset
      id="jest_api_report"
      kind="doc"
      path="generated/enhanced-rstest-migration/jest-api-migration.md"
    />

    <Agent id="apply-jest-api-migration" produces={['jest_api_report']}>
      <Prompt skills={['rstest-docs']}>
        <System>
          You are migrating Jest APIs to Rstest in packages/enhanced tests. Make
          localized edits, preserve test intent, and avoid broad refactors.
        </System>
        <Skill name="rstest-docs" />
        <Context>
          {ctx.file('packages/enhanced/task/request.md', {
            as: 'Task request',
            mode: 'quote',
          })}
          {ctx.file('packages/enhanced/test/compiler-unit/container/HoistContainerReferencesPlugin.test.ts', {
            as: 'packages/enhanced/test/compiler-unit/container/HoistContainerReferencesPlugin.test.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/compiler-unit/sharing/SharePlugin.test.ts', {
            as: 'packages/enhanced/test/compiler-unit/sharing/SharePlugin.test.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/compiler-unit/sharing/SharePlugin.memfs.test.ts', {
            as: 'packages/enhanced/test/compiler-unit/sharing/SharePlugin.memfs.test.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/unit/container/ContainerEntryModule.test.ts', {
            as: 'packages/enhanced/test/unit/container/ContainerEntryModule.test.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/unit/container/RemoteModule.test.ts', {
            as: 'packages/enhanced/test/unit/container/RemoteModule.test.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/unit/sharing/SharePlugin.test.ts', {
            as: 'packages/enhanced/test/unit/sharing/SharePlugin.test.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/unit/sharing/ConsumeSharedRuntimeModule.test.ts', {
            as: 'packages/enhanced/test/unit/sharing/ConsumeSharedRuntimeModule.test.ts',
            mode: 'code',
          })}
          {ctx.file('packages/enhanced/test/unit/sharing/utils-filtering.test.ts', {
            as: 'packages/enhanced/test/unit/sharing/utils-filtering.test.ts',
            mode: 'code',
          })}
        </Context>
        <Instructions>
          Apply the edits below to the real files, then write the report.

          Replace Jest APIs in the provided test files with Rstest equivalents:
          - `jest.fn` -> `rs.fn`
          - `jest.spyOn` -> `rs.spyOn`
          - `jest.mock` / `jest.doMock` -> `rs.mock` / `rs.doMock`
          - `jest.resetModules` -> `rs.resetModules`
          - `jest.clearAllMocks` / `jest.resetAllMocks` / `jest.restoreAllMocks`
            -> `rs.clearAllMocks` / `rs.resetAllMocks` / `rs.restoreAllMocks`
          - `jest.requireActual` -> `await rs.importActual(...)` or import with
            `{ rstest: 'importActual' }`

          Add `import { rs } from '@rstest/core'` where needed. If a file already
          uses globals, keep them and only add `rs` where required.

          If you encounter `jest.isolateModules`, refactor to use
          `rs.resetModules()` and a dynamic `import()` that keeps the same test
          intent.

          After edits, write a report to `{{assets.jest_api_report.path}}` with:
          - Files updated and what APIs were replaced.
          - Any remaining Jest API usage you saw but did not change (call out
            file paths for follow-up).
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
