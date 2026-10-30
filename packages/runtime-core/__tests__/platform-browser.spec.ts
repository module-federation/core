import { describe, expect, it } from '@rstest/core';
import type { ModuleInfo } from '@module-federation/sdk';
import { assignRemoteInfo } from '../src/plugins/snapshot';
import type { RemoteInfo } from '../src/type';

const snapshot = {
  version: '1.0.0',
  buildVersion: '1.0.0',
  globalName: 'app',
  remoteEntry: 'remoteEntry.js',
  remoteEntryType: 'global',
  ssrRemoteEntry: 'ssr/remoteEntry.js',
  ssrRemoteEntryType: 'commonjs-module',
  publicPath: 'https://web.example.com/',
  ssrPublicPath: 'https://ssr.example.com/',
} as unknown as ModuleInfo;

const resolveEntry = (inBrowser: boolean) => {
  const remoteInfo = { name: 'app' } as RemoteInfo;
  assignRemoteInfo(remoteInfo, snapshot, inBrowser);
  return remoteInfo.entry;
};

describe('the platform decides browser resource urls', () => {
  it('uses the server public path when the platform is not a browser', () => {
    expect(resolveEntry(false)).toBe(
      'https://ssr.example.com/ssr/remoteEntry.js',
    );
  });

  it('uses the browser public path when the platform is a browser', () => {
    expect(resolveEntry(true)).toBe('https://web.example.com/remoteEntry.js');
  });
});
