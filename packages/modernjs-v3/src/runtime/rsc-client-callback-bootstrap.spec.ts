import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const getBootstrapSource = () => {
  const bootstrapFilePath = path.resolve(
    __dirname,
    './rsc-client-callback-bootstrap.js',
  );
  return fs.readFileSync(bootstrapFilePath, 'utf-8');
};

describe('rsc-client-callback-bootstrap', () => {
  it('registers resolveActionId via runtime API', () => {
    const source = getBootstrapSource();

    expect(source).toContain(
      "import { setResolveActionId } from '@modern-js/runtime/rsc/client';",
    );
    expect(source).toContain('setResolveActionId(resolveActionId);');
    expect(source).not.toContain('__MODERN_RSC_ACTION_RESOLVER__');
  });

  it('falls back to root action endpoint when entry name is missing', () => {
    const source = getBootstrapSource();

    expect(source).toContain(
      "if (!entryName || entryName === 'main' || entryName === 'index')",
    );
  });

  it('avoids remapping action ids via host uniqueName heuristics', () => {
    const source = getBootstrapSource();

    expect(source).not.toContain('initializeSharingData.uniqueName');
  });

  it('keeps callback installation retries and chunk-loader hook for late runtimes', () => {
    const source = getBootstrapSource();

    expect(source).toContain('const CALLBACK_INSTALL_RETRY_DELAY_MS = 50;');
    expect(source).toContain('const MAX_CALLBACK_INSTALL_ATTEMPTS = 120;');
    expect(source).toContain('function hookChunkLoaderInstall()');
    expect(source).toContain("Object.defineProperty(webpackRequire, 'e', {");
    expect(source).not.toContain('webpackRequire.e = wrappedChunkLoader;');
  });

  it('fails closed when raw action ids become ambiguous across remotes', () => {
    const source = getBootstrapSource();

    expect(source).toContain('if (remappedId === false) {');
    expect(source).toContain('Ambiguous remote action id');
    expect(source).not.toContain('if (remappedId === false) {\n    return id;');
  });

  it('does not cache fallback alias resolution before runtime is available', () => {
    const source = getBootstrapSource();
    const runtimeGuardIndex = source.indexOf('if (!runtimeInstance) {');
    const resolvedFlagIndex = source.indexOf(
      'hasResolvedFallbackAlias = true;',
    );

    expect(runtimeGuardIndex).toBeGreaterThan(-1);
    expect(resolvedFlagIndex).toBeGreaterThan(runtimeGuardIndex);
  });
});
