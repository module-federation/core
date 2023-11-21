'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var generateSnapshotFromManifest_1 = require('../src/generateSnapshotFromManifest');
describe('simpleJoinRemoteEntry', function () {
  it('return remoteEntryName while remoteEntryPath is empty', function () {
    var remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: '',
    };
    expect(
      (0, generateSnapshotFromManifest_1.simpleJoinRemoteEntry)(
        remoteEntry.path,
        remoteEntry.name,
      ),
    ).toEqual(remoteEntry.name);
  });
  it('normalize remoteEntryPath while remoteEntryPath startsWith "."', function () {
    var remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: '.',
    };
    expect(
      (0, generateSnapshotFromManifest_1.simpleJoinRemoteEntry)(
        remoteEntry.path,
        remoteEntry.name,
      ),
    ).toEqual(remoteEntry.name);
  });
  it('normalize remoteEntryPath while remoteEntryPath startsWith "./"', function () {
    var remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: './dist/vmok',
    };
    expect(
      (0, generateSnapshotFromManifest_1.simpleJoinRemoteEntry)(
        remoteEntry.path,
        remoteEntry.name,
      ),
    ).toEqual('dist/vmok/'.concat(remoteEntry.name));
  });
  it('normalize remoteEntryPath while remoteEntryPath startsWith "/"', function () {
    var remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: '/dist/vmok',
    };
    expect(
      (0, generateSnapshotFromManifest_1.simpleJoinRemoteEntry)(
        remoteEntry.path,
        remoteEntry.name,
      ),
    ).toEqual('dist/vmok/'.concat(remoteEntry.name));
  });
  it('normalize remoteEntryPath while remoteEntryPath endsWith "/"', function () {
    var remoteEntry = {
      name: 'vmok-remote-entry.js',
      path: '/dist/vmok/',
    };
    expect(
      (0, generateSnapshotFromManifest_1.simpleJoinRemoteEntry)(
        remoteEntry.path,
        remoteEntry.name,
      ),
    ).toEqual('dist/vmok/'.concat(remoteEntry.name));
  });
});
