import { manifest, snapshot } from './resources/manifestSnapshotMap';
import { generateSnapshotFromManifest } from '../src/generateSnapshotFromManifest';

describe('generateSnapshotFromManifest', () => {
  it('preserves the dev revision separately from the release build version', () => {
    const source = manifest.devAppManifest;
    const result = generateSnapshotFromManifest({
      ...source,
      metaData: {
        ...source.metaData,
        buildInfo: { ...source.metaData.buildInfo, devRevision: '123' },
      },
    });
    expect(result.devRevision).toBe('123');
    expect(result.buildVersion).toBe(source.metaData.buildInfo.buildVersion);
  });
  it('preserves per-expose rendering metadata without changing legacy modules', () => {
    const input = {
      ...manifest.devAppManifest,
      metaData: {
        ...manifest.devAppManifest.metaData,
        serviceBaseUrl: 'https://service.example.test/weather/',
      },
      exposes: manifest.devAppManifest.exposes.map((item, index) =>
        index === 0
          ? {
              ...item,
              render: 'bridge' as const,
              servicePath: '__mf/service/App',
              // Old metadata must not be copied to the runtime Snapshot.
              isService: true,
            }
          : item,
      ),
    };
    const result = generateSnapshotFromManifest(input);
    expect(result.modules[0]).toMatchObject({
      render: 'bridge',
      servicePath: '__mf/service/App',
    });
    expect(result.modules[0]).not.toHaveProperty('isService');
    expect(result.serviceBaseUrl).toBe('https://service.example.test/weather/');
    expect(result.modules.slice(1)).toEqual(
      snapshot.devAppSnapshot.modules.slice(1),
    );
    expect(manifest.devAppManifest.exposes[0]).not.toHaveProperty('render');
  });
  it('does not replace a service deployment with the manifest or asset origin', () => {
    const input = {
      ...manifest.devAppManifest,
      metaData: {
        ...manifest.devAppManifest.metaData,
        publicPath: 'https://cdn.example.test/assets/',
        serviceBaseUrl: 'https://private-render.example.test/base/',
      },
    };
    const result = generateSnapshotFromManifest(input, {
      version: 'https://registry.example.test/mf-manifest.json',
    });
    expect(result.serviceBaseUrl).toBe(
      'https://private-render.example.test/base/',
    );
    expect(result.publicPath).toBe('https://cdn.example.test/assets/');
  });
  it('return basic app snapshot with only manifest params in dev', () => {
    const remoteSnapshot = generateSnapshotFromManifest(
      manifest.devAppManifest,
    );
    expect(remoteSnapshot).toEqual(snapshot.devAppSnapshot);
  });
  it('retains the Service discriminator even when its value is invalid', () => {
    const input = {
      ...manifest.devAppManifest,
      exposes: manifest.devAppManifest.exposes.map((item, index) =>
        index === 0 ? { ...item, servicePath: undefined } : item,
      ),
    };
    const result = generateSnapshotFromManifest(input);
    expect(result.modules[0]).toHaveProperty('servicePath', undefined);
    expect(result.modules[1]).not.toHaveProperty('servicePath');
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

  it('infers publicPath from manifest url when manifest publicPath is empty', () => {
    const manifestWithEmptyPublicPath = JSON.parse(
      JSON.stringify(manifest.devAppManifest),
    );
    manifestWithEmptyPublicPath.metaData.publicPath = '';
    const remoteSnapshot = generateSnapshotFromManifest(
      manifestWithEmptyPublicPath,
      { version: 'http://localhost:2006/ssr/mf-manifest.json' },
    );
    expect(remoteSnapshot.publicPath).toBe('http://localhost:2006/ssr/');
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
    expect('ssrPublicPath' in remoteSnapshot).toBe(false);
  });
});
