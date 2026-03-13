import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRemoteEntry, getRemoteInfo } from '../src/utils/load';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import { RUNTIME_001, RUNTIME_008 } from '@module-federation/error-codes';
import { mockStaticServer, removeScriptTags } from './mock/utils';

// All fixture URLs are served via two complementary mechanisms both pointing to __tests__/:
//   1. mockScriptDomResponse (setup.ts) — patches Element.prototype.appendChild, executes
//      matching JS files inline, fires element.onload without a real network request.
//   2. mockStaticServer (below) — mocks window.fetch so jsdom's background script-fetch
//      also gets a valid response instead of failing with ECONNREFUSED.
const BASE = 'http://localhost:1111/resources/load';

mockStaticServer({
  baseDir: __dirname,
  filterKeywords: [],
  basename: 'http://localhost:1111/',
});

const createMF = () => new ModuleFederation({ name: 'test-host', remotes: [] });

describe('getRemoteEntry - script load error discrimination', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
    delete (globalThis as any)['remote'];
    removeScriptTags();
  });

  afterEach(() => {
    delete (globalThis as any)['remote'];
    removeScriptTags();
  });

  it('script load failure is reported as RUNTIME_008 with the original error included', async () => {
    // "missing.js" does not exist on disk. The mockScriptDomResponse interceptor tries
    // to fs.readFileSync it, throws ENOENT, which propagates synchronously through
    // document.head.appendChild → loadScript's Promise executor → promise rejects.
    // The onRejected handler in loadEntryScript wraps it as RUNTIME_008.
    const entry = `${BASE}/missing.js`;
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry });

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain(RUNTIME_008);
    // Original ENOENT message is forwarded into the RUNTIME_008 error
    expect(err.message).toMatch(/missing\.js|ENOENT/);
  });

  it('IIFE execution error is reported as RUNTIME_008 with ScriptExecutionError details', async () => {
    // exec-error.js dispatches a window ErrorEvent with its own URL as filename.
    // dom.ts's executionErrorHandler captures it; when onload fires afterwards,
    // onErrorCallback(ScriptExecutionError) is called → loadScript rejects.
    const entry = `${BASE}/exec-error.js`;
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry });

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain(RUNTIME_008);
    expect(err.message).toContain('ScriptExecutionError');
    expect(err.message).toContain('TypeError: exec failed');
  });

  it('script loaded successfully but global not registered throws RUNTIME_001, not RUNTIME_008', async () => {
    // no-global.js executes without side effects — global is never registered.
    // loadScript resolves (onload fires), handleRemoteEntryLoaded finds no global → RUNTIME_001.
    // The key assertion: RUNTIME_001 is NOT swallowed and replaced with RUNTIME_008.
    const entry = `${BASE}/no-global.js`;
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry });

    const err = await getRemoteEntry({ origin, remoteInfo }).catch((e) => e);

    expect(err.message).toContain(RUNTIME_001);
    expect(err.message).not.toContain(RUNTIME_008);
  });

  it('script loaded and global registered returns the remote entry exports', async () => {
    // success.js sets globalThis['remote'] = { get, init } before onload fires.
    const entry = `${BASE}/success.js`;
    const origin = createMF();
    const remoteInfo = getRemoteInfo({ name: 'remote', entry });

    const result = await getRemoteEntry({ origin, remoteInfo });

    expect(result).toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );
  });
});
