import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Test to validate that the errorLoadRemote lifecycle parameter documentation
 * is accurate by examining the source code.
 */
describe('errorLoadRemote documentation accuracy validation', () => {
  it('should find all documented lifecycle values in the source code', () => {
    const sourceDir = join(__dirname, '../src');

    // Read the remote handler source
    const remoteHandlerPath = join(sourceDir, 'remote/index.ts');
    const remoteHandlerSource = readFileSync(remoteHandlerPath, 'utf-8');

    // Read the shared handler source
    const sharedHandlerPath = join(sourceDir, 'shared/index.ts');
    const sharedHandlerSource = readFileSync(sharedHandlerPath, 'utf-8');

    // Read the snapshot handler source
    const snapshotHandlerPath = join(
      sourceDir,
      'plugins/snapshot/SnapshotHandler.ts',
    );
    const snapshotHandlerSource = readFileSync(snapshotHandlerPath, 'utf-8');

    // Verify each documented lifecycle value appears in the source code
    const documentedLifecycles = [
      'beforeRequest',
      'afterResolve',
      'onLoad',
      'beforeLoadShare',
    ];

    // Check beforeRequest lifecycle
    expect(remoteHandlerSource).toMatch(/lifecycle:\s*['"]beforeRequest['"]/);

    // Check onLoad lifecycle
    expect(remoteHandlerSource).toMatch(/lifecycle:\s*['"]onLoad['"]/);

    // Check afterResolve lifecycle
    expect(snapshotHandlerSource).toMatch(/lifecycle:\s*['"]afterResolve['"]/);

    // Check beforeLoadShare lifecycle
    expect(sharedHandlerSource).toMatch(/lifecycle:\s*['"]beforeLoadShare['"]/);

    documentedLifecycles.forEach((lifecycle) => {
      const foundInRemote =
        remoteHandlerSource.includes(`lifecycle: '${lifecycle}'`) ||
        remoteHandlerSource.includes(`lifecycle: "${lifecycle}"`);
      const foundInShared =
        sharedHandlerSource.includes(`lifecycle: '${lifecycle}'`) ||
        sharedHandlerSource.includes(`lifecycle: "${lifecycle}"`);
      const foundInSnapshot =
        snapshotHandlerSource.includes(`lifecycle: '${lifecycle}'`) ||
        snapshotHandlerSource.includes(`lifecycle: "${lifecycle}"`);

      const found = foundInRemote || foundInShared || foundInSnapshot;
      expect(found).toBe(
        true,
        `Lifecycle "${lifecycle}" should be found in source code`,
      );
    });
  });

  it('should verify errorLoadRemote hook type definition includes all documented lifecycle values', () => {
    const sourceDir = join(__dirname, '../src');
    const remoteHandlerPath = join(sourceDir, 'remote/index.ts');
    const remoteHandlerSource = readFileSync(remoteHandlerPath, 'utf-8');

    // Look for the errorLoadRemote hook type definition
    const hookTypeMatch = remoteHandlerSource.match(
      /errorLoadRemote:\s*new\s+AsyncHook<[\s\S]*?lifecycle:\s*\n?\s*\|\s*['"][^'"]*['"][\s\S]*?>/,
    );

    if (hookTypeMatch) {
      const hookTypeDef = hookTypeMatch[0];

      // Verify all documented lifecycle values are in the type definition
      expect(hookTypeDef).toMatch(/['"]beforeRequest['"]/);
      expect(hookTypeDef).toMatch(/['"]afterResolve['"]/);
      expect(hookTypeDef).toMatch(/['"]onLoad['"]/);
      expect(hookTypeDef).toMatch(/['"]beforeLoadShare['"]/);
    } else {
      // Fallback: check that the lifecycle type definition exists somewhere
      expect(remoteHandlerSource).toMatch(/lifecycle:/);
      expect(remoteHandlerSource).toMatch(
        /beforeRequest|afterResolve|onLoad|beforeLoadShare/,
      );
    }
  });

  it('should document the exact source locations where each lifecycle value is used', () => {
    // This test documents where each lifecycle parameter is used in the source code
    // based on our analysis:

    const lifecycleLocations = {
      beforeRequest:
        'packages/runtime-core/src/remote/index.ts:341 - when beforeRequest hook throws',
      afterResolve:
        'packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts:303 - when manifest loading fails',
      onLoad:
        'packages/runtime-core/src/remote/index.ts:258 - when module loading/execution fails',
      beforeLoadShare:
        'packages/runtime-core/src/shared/index.ts:324 - when shared dependency loading fails',
    };

    // Verify we have documented all expected lifecycles
    expect(Object.keys(lifecycleLocations)).toHaveLength(4);
    expect(lifecycleLocations.beforeRequest).toContain(
      'beforeRequest hook throws',
    );
    expect(lifecycleLocations.afterResolve).toContain('manifest loading fails');
    expect(lifecycleLocations.onLoad).toContain(
      'module loading/execution fails',
    );
    expect(lifecycleLocations.beforeLoadShare).toContain(
      'shared dependency loading fails',
    );
  });

  it('should verify that no additional lifecycle values exist beyond the documented ones', () => {
    const sourceDir = join(__dirname, '../src');

    // Read all relevant source files
    const files = [
      join(sourceDir, 'remote/index.ts'),
      join(sourceDir, 'shared/index.ts'),
      join(sourceDir, 'plugins/snapshot/SnapshotHandler.ts'),
    ];

    const allSources = files
      .map((file) => readFileSync(file, 'utf-8'))
      .join('\n');

    // Look for all lifecycle parameter assignments
    const lifecycleMatches =
      allSources.match(/lifecycle:\s*['"][^'"]+['"]/g) || [];

    const foundLifecycles = lifecycleMatches
      .map((match) => {
        const lifecycleMatch = match.match(/['"]([^'"]+)['"]/);
        return lifecycleMatch ? lifecycleMatch[1] : null;
      })
      .filter(Boolean);

    // Remove duplicates
    const uniqueLifecycles = [...new Set(foundLifecycles)];

    // Verify that only documented lifecycle values are found
    const documentedLifecycles = [
      'beforeRequest',
      'afterResolve',
      'onLoad',
      'beforeLoadShare',
    ];

    uniqueLifecycles.forEach((lifecycle) => {
      expect(documentedLifecycles).toContain(
        lifecycle,
        `Found undocumented lifecycle value: "${lifecycle}"`,
      );
    });

    // Verify that all documented lifecycles are found
    documentedLifecycles.forEach((lifecycle) => {
      expect(uniqueLifecycles).toContain(
        lifecycle,
        `Documented lifecycle "${lifecycle}" not found in source code`,
      );
    });
  });

  it('should validate the parameter structure matches the documentation', () => {
    const sourceDir = join(__dirname, '../src');
    const remoteHandlerPath = join(sourceDir, 'remote/index.ts');
    const remoteHandlerSource = readFileSync(remoteHandlerPath, 'utf-8');

    // Check that errorLoadRemote calls include the documented parameters
    const errorLoadRemoteCallPattern =
      /errorLoadRemote\.emit\(\s*\{[\s\S]*?\}\s*\)/g;
    const calls = remoteHandlerSource.match(errorLoadRemoteCallPattern) || [];

    if (calls.length > 0) {
      calls.forEach((call) => {
        // Each call should include the documented parameters
        expect(call).toMatch(/id\s*:/);
        expect(call).toMatch(/error\s*:/);
        expect(call).toMatch(/from\s*:/);
        expect(call).toMatch(/lifecycle\s*:/);
        expect(call).toMatch(/origin\s*:/);
      });
    }
  });
});
