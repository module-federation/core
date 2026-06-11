import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getInitHostModule,
  getRemoteEntryModule,
} from '../../src/plugin/generators';
import type { ModuleFederationConfigNormalized } from '../../src/types';

function createConfig(): ModuleFederationConfigNormalized {
  return {
    name: 'host',
    filename: 'host.bundle',
    remotes: {
      mini: 'mini@app://mini.bundle?token=a"b&path=C:\\tmp',
    },
    exposes: {},
    shared: {},
    shareStrategy: 'loaded-first',
    plugins: [],
    dts: false,
  };
}

describe('module generators', () => {
  it('serializes remotes as escaped JavaScript string literals', () => {
    const module = getInitHostModule(createConfig());

    expect(module).toContain('alias: "mini"');
    expect(module).toContain(
      'entry: "app://mini.bundle?token=a\\"b&path=C:\\\\tmp"',
    );
    expect(module).toContain('entryGlobalName: "mini"');
  });

  it('uses the same remote serialization in remote entries', () => {
    const module = getRemoteEntryModule(createConfig(), {
      tmpDir: path.join('node_modules', '.mf-metro'),
      projectDir: process.cwd(),
    });

    expect(module).toContain('alias: "mini"');
    expect(module).toContain(
      'entry: "app://mini.bundle?token=a\\"b&path=C:\\\\tmp"',
    );
    expect(module).toContain('entryGlobalName: "mini"');
  });
});
