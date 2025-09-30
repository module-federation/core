"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _promises = require("fs/promises");
const _os = require("os");
const _path = require("path");
const _shared = require("../trace/shared");
const _builddiagnostics = require("./build-diagnostics");
async function readBuildDiagnostics(dir) {
    return JSON.parse(await (0, _promises.readFile)((0, _path.join)(dir, 'diagnostics', 'build-diagnostics.json'), 'utf8'));
}
describe('build-diagnostics', ()=>{
    it('records framework version to framework.json correctly', async ()=>{
        const tmpDir = await (0, _promises.mkdtemp)((0, _path.join)((0, _os.tmpdir)(), 'build-diagnostics'));
        (0, _shared.setGlobal)('distDir', tmpDir);
        // Record the initial diagnostics and make sure it's correct.
        await (0, _builddiagnostics.recordFrameworkVersion)('14.2.3');
        let diagnostics = JSON.parse(await (0, _promises.readFile)((0, _path.join)(tmpDir, 'diagnostics', 'framework.json'), 'utf8'));
        expect(diagnostics.version).toEqual('14.2.3');
    });
    it('records build diagnostics to a file correctly', async ()=>{
        const tmpDir = await (0, _promises.mkdtemp)((0, _path.join)((0, _os.tmpdir)(), 'build-diagnostics'));
        (0, _shared.setGlobal)('distDir', tmpDir);
        // Record the initial diagnostics and make sure it's correct.
        await (0, _builddiagnostics.updateBuildDiagnostics)({
            buildStage: 'compile'
        });
        let diagnostics = await readBuildDiagnostics(tmpDir);
        expect(diagnostics.buildStage).toEqual('compile');
        // Add a new build option. Make sure that existing fields are preserved.
        await (0, _builddiagnostics.updateBuildDiagnostics)({
            buildStage: 'compile-server',
            buildOptions: {
                useBuildWorker: String(false)
            }
        });
        diagnostics = await readBuildDiagnostics(tmpDir);
        expect(diagnostics.buildStage).toEqual('compile-server');
        expect(diagnostics.buildOptions).toEqual({
            useBuildWorker: 'false'
        });
        // Make sure that it keeps existing build options when adding a new one.
        await (0, _builddiagnostics.updateBuildDiagnostics)({
            buildStage: 'compile-client',
            buildOptions: {
                experimentalBuildMode: 'compile'
            }
        });
        diagnostics = await readBuildDiagnostics(tmpDir);
        expect(diagnostics.buildStage).toEqual('compile-client');
        expect(diagnostics.buildOptions).toEqual({
            experimentalBuildMode: 'compile',
            useBuildWorker: 'false'
        });
    });
});

//# sourceMappingURL=build-diagnostics.test.js.map