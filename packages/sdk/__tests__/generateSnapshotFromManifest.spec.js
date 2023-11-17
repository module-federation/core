"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var manifestSnapshotMap_1 = require("./resources/manifestSnapshotMap");
var generateSnapshotFromManifest_1 = require("../src/generateSnapshotFromManifest");
describe('generateSnapshotFromManifest', function () {
    it('return basic app snapshot with only manifest params in dev', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifest);
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshot);
    });
    it('return modulePath while expose.path existed', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifest);
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshot);
        manifestSnapshotMap_1.manifest.devAppManifest.exposes.forEach(function (expose) {
            if (expose.path) {
                expect(Boolean(remoteSnapshot.modules.find(function (m) { return m.modulePath === expose.path; }))).toEqual(true);
            }
        });
    });
    it('return basic app snapshot with manifest params and version in dev', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifest, { version: 'http://localhost:2006/vmok-manifest.json' });
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshotWithVersion);
    });
    it('return basic app snapshot with only manifest params in dev with getPublicPath', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifestWithGetPublicPath);
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshotWithGetPublicPath);
    });
    it('return app snapshot with manifest params in dev with overrides', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifest, {
            overrides: {
                '@garfish/micro-app-sub4': 'http://localhost:8080/vmok-manifest.json',
                '@garfish/micro-app-sub3': '1.0.3',
            },
        });
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshotWithOverrides);
    });
    it('return app snapshot with manifest params in dev with part remotes', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifest, {
            remotes: {
                '@garfish/micro-app-sub3': '1.0.3',
            },
        });
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshotWithPartRemotes);
    });
    it('return app snapshot with manifest params in dev with remotes', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifest, {
            remotes: {
                '@garfish/micro-app-sub4': '1.2.3',
                '@garfish/micro-app-sub3': '1.0.3',
            },
        });
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshotWithRemotes);
    });
    it('return app snapshot with manifest params in dev with remotes and overrides', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifest, {
            remotes: {
                '@garfish/micro-app-sub4': '1.2.3',
                '@garfish/micro-app-sub3': '1.0.3',
            },
            overrides: {
                '@garfish/micro-app-sub4': 'http://localhost:8080/vmok-manifest.json',
                '@garfish/micro-app-sub3': '1.0.4',
            },
        });
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshotWithRemotesAndOverrides);
    });
    it('return app snapshot with manifest params in dev with all params', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.devAppManifest, {
            remotes: {
                '@garfish/micro-app-sub4': '1.2.3',
                '@garfish/micro-app-sub3': '1.0.3',
            },
            overrides: {
                '@garfish/micro-app-sub4': 'http://localhost:8080/vmok-manifest.json',
                '@garfish/micro-app-sub3': '1.0.4',
            },
        });
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.devAppSnapshotWithAllParams);
    });
    it('return basic app snapshot with only manifest params in prod', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.prodAppManifest);
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.prodAppSnapshot);
    });
    it('return basic app snapshot with only manifest params in prod with getPublicPath', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.prodAppManifestWithGetPublicPath);
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.prodAppSnapshotWithGetPublicPath);
    });
    it('return app snapshot with manifest params in prod with all params', function () {
        var remoteSnapshot = (0, generateSnapshotFromManifest_1.generateSnapshotFromManifest)(manifestSnapshotMap_1.manifest.prodAppManifest, {
            remotes: {
                '@garfish/micro-app-sub4': '1.2.3',
                '@garfish/micro-app-sub3': '1.0.3',
            },
            overrides: {
                '@garfish/micro-app-sub4': 'http://localhost:8080/vmok-manifest.json',
                '@garfish/micro-app-sub3': '1.0.4',
            },
        });
        expect(remoteSnapshot).toEqual(manifestSnapshotMap_1.snapshot.prodAppSnapshotWithAllParams);
    });
});
