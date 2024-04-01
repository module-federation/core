import { simpleJoinRemoteEntry } from '../src/generateSnapshotFromManifest';

describe('simpleJoinRemoteEntry', () => {
  it('return remoteEntryName while remoteEntryPath is empty', () => {
    const remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: '',
    };
    expect(simpleJoinRemoteEntry(remoteEntry.path, remoteEntry.name)).toEqual(
      remoteEntry.name,
    );
  });

  it('normalize remoteEntryPath while remoteEntryPath startsWith "."', () => {
    const remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: '.',
    };
    expect(simpleJoinRemoteEntry(remoteEntry.path, remoteEntry.name)).toEqual(
      remoteEntry.name,
    );
  });

  it('normalize remoteEntryPath while remoteEntryPath startsWith "./"', () => {
    const remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: './dist/vmok',
    };
    expect(simpleJoinRemoteEntry(remoteEntry.path, remoteEntry.name)).toEqual(
      `dist/vmok/${remoteEntry.name}`,
    );
  });

  it('normalize remoteEntryPath while remoteEntryPath startsWith "/"', () => {
    const remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: '/dist/vmok',
    };
    expect(simpleJoinRemoteEntry(remoteEntry.path, remoteEntry.name)).toEqual(
      `dist/vmok/${remoteEntry.name}`,
    );
  });

  it('normalize remoteEntryPath while remoteEntryPath endsWith "/"', () => {
    const remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: '/dist/vmok/',
    };
    expect(simpleJoinRemoteEntry(remoteEntry.path, remoteEntry.name)).toEqual(
      `dist/vmok/${remoteEntry.name}`,
    );
  });
});
