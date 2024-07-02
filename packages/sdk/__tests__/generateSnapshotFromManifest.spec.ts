import { manifest, snapshot } from './resources/manifestSnapshotMap';
import { generateSnapshotFromManifest } from '../src/generateSnapshotFromManifest';

describe('generateSnapshotFromManifest', () => {
  it('return basic app snapshot with only manifest params in dev', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshot);
  });

  it('return modulePath while expose.path existed', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshot);
    manifest.devAppManifest.exposes.forEach((expose) => {
      if (expose.path) {
        expect(
          Boolean(
            remoteSnapshot.modules.find((m) => m.modulePath === expose.path),
          ),
        ).toEqual(true);
      }
    });
  });

  it('return basic app snapshot with manifest params and version in dev', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
      { version: 'http://localhost:2006/vmok-manifest.json' },
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshotWithVersion);
  });

  it('return basic app snapshot with only manifest params in dev with getPublicPath', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifestWithGetPublicPath,
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshotWithGetPublicPath);
  });

  it('return app snapshot with manifest params in dev with overrides', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
      {
        overrides: {
          '@garfish/micro-app-sub4': 'http://localhost:8080/vmok-manifest.json',
          '@garfish/micro-app-sub3': '1.0.3',
        },
      },
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshotWithOverrides);
  });

  it('return app snapshot with manifest params in dev with part remotes', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
      {
        remotes: {
          '@garfish/micro-app-sub3': '1.0.3',
        },
      },
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshotWithPartRemotes);
  });

  it('return app snapshot with manifest params in dev with remotes', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
      {
        remotes: {
          '@garfish/micro-app-sub4': '1.2.3',
          '@garfish/micro-app-sub3': '1.0.3',
        },
      },
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshotWithRemotes);
  });

  it('return app snapshot with manifest params in dev with remotes and overrides', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
      {
        remotes: {
          '@garfish/micro-app-sub4': '1.2.3',
          '@garfish/micro-app-sub3': '1.0.3',
        },
        overrides: {
          '@garfish/micro-app-sub4': 'http://localhost:8080/vmok-manifest.json',
          '@garfish/micro-app-sub3': '1.0.4',
        },
      },
    );
    expect(remoteSnapshot).toEqual(
      snapshot.devAppSnapshotWithRemotesAndOverrides,
    );
  });

  it('return app snapshot with manifest params in dev with all params', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
      {
        remotes: {
          '@garfish/micro-app-sub4': '1.2.3',
          '@garfish/micro-app-sub3': '1.0.3',
        },
        overrides: {
          '@garfish/micro-app-sub4': 'http://localhost:8080/vmok-manifest.json',
          '@garfish/micro-app-sub3': '1.0.4',
        },
      },
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshotWithAllParams);
  });

  it('return basic app snapshot with only manifest params in prod', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.prodAppManifest,
    );
    expect(remoteSnapshot).toEqual(snapshot.prodAppSnapshot);
  });

  it('return basic app snapshot with only manifest params in prod with getPublicPath', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.prodAppManifestWithGetPublicPath,
    );
    expect(remoteSnapshot).toEqual(snapshot.prodAppSnapshotWithGetPublicPath);
  });

  it('return app snapshot with manifest params in prod with all params', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.prodAppManifest,
      {
        remotes: {
          '@garfish/micro-app-sub4': '1.2.3',
          '@garfish/micro-app-sub3': '1.0.3',
        },
        overrides: {
          '@garfish/micro-app-sub4': 'http://localhost:8080/vmok-manifest.json',
          '@garfish/micro-app-sub3': '1.0.4',
        },
      },
    );
    expect(remoteSnapshot).toEqual(snapshot.prodAppSnapshotWithAllParams);
  });

  it('return snapshot with ssrRemoteEntry when manifest has ssrRemoteEntry field', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.ssrAppManifest,
      {},
    );
    expect(remoteSnapshot).toEqual(snapshot.ssrProdAppSnapshotWithAllParams);
  });
});
