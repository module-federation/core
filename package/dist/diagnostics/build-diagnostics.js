"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    recordFetchMetrics: null,
    recordFrameworkVersion: null,
    updateBuildDiagnostics: null,
    updateIncrementalBuildMetrics: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    recordFetchMetrics: function() {
        return recordFetchMetrics;
    },
    recordFrameworkVersion: function() {
        return recordFrameworkVersion;
    },
    updateBuildDiagnostics: function() {
        return updateBuildDiagnostics;
    },
    updateIncrementalBuildMetrics: function() {
        return updateIncrementalBuildMetrics;
    }
});
const _promises = require("fs/promises");
const _path = require("path");
const _shared = require("../trace/shared");
const DIAGNOSTICS_DIR = 'diagnostics';
const DIAGNOSTICS_FILE = 'build-diagnostics.json';
const FETCH_METRICS_FILE = 'fetch-metrics.json';
const INCREMENTAL_BUILDS_FILE = 'incremental-build-diagnostics.json';
const FRAMEWORK_VERSION_FILE = 'framework.json';
async function getDiagnosticsDir() {
    const distDir = _shared.traceGlobals.get('distDir');
    const diagnosticsDir = (0, _path.join)(distDir, DIAGNOSTICS_DIR);
    await (0, _promises.mkdir)(diagnosticsDir, {
        recursive: true
    });
    return diagnosticsDir;
}
async function recordFrameworkVersion(version) {
    const diagnosticsDir = await getDiagnosticsDir();
    const frameworkVersionFile = (0, _path.join)(diagnosticsDir, FRAMEWORK_VERSION_FILE);
    await (0, _promises.writeFile)(frameworkVersionFile, JSON.stringify({
        name: 'Next.js',
        version
    }));
}
async function updateBuildDiagnostics(diagnostics) {
    const diagnosticsDir = await getDiagnosticsDir();
    const diagnosticsFile = (0, _path.join)(diagnosticsDir, DIAGNOSTICS_FILE);
    const existingDiagnostics = JSON.parse(await (0, _promises.readFile)(diagnosticsFile, 'utf8').catch(()=>'{}'));
    const updatedBuildOptions = {
        ...existingDiagnostics.buildOptions ?? {},
        ...diagnostics.buildOptions ?? {}
    };
    const updatedDiagnostics = {
        ...existingDiagnostics,
        ...diagnostics,
        buildOptions: updatedBuildOptions
    };
    await (0, _promises.writeFile)(diagnosticsFile, JSON.stringify(updatedDiagnostics, null, 2));
}
async function recordFetchMetrics(exportResult) {
    const diagnosticsDir = await getDiagnosticsDir();
    const diagnosticsFile = (0, _path.join)(diagnosticsDir, FETCH_METRICS_FILE);
    const fetchMetricsByPath = {};
    for (const [appPath, { fetchMetrics }] of exportResult.byPath){
        if (fetchMetrics) {
            fetchMetricsByPath[appPath] = fetchMetrics;
        }
    }
    return (0, _promises.writeFile)(diagnosticsFile, JSON.stringify(fetchMetricsByPath, null, 2));
}
async function updateIncrementalBuildMetrics(diagnostics) {
    const diagnosticsDir = await getDiagnosticsDir();
    const diagnosticsFile = (0, _path.join)(diagnosticsDir, INCREMENTAL_BUILDS_FILE);
    const existingDiagnostics = JSON.parse(await (0, _promises.readFile)(diagnosticsFile, 'utf8').catch(()=>'{}'));
    const updatedDiagnostics = {
        ...existingDiagnostics,
        ...diagnostics
    };
    await (0, _promises.writeFile)(diagnosticsFile, JSON.stringify(updatedDiagnostics, null, 2));
}

//# sourceMappingURL=build-diagnostics.js.map